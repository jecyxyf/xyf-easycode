"""Exercise installer behavior using projects confined to this test directory."""

from contextlib import redirect_stdout
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


TEST_DIRECTORY = Path(__file__).resolve().parent
REPOSITORY = TEST_DIRECTORY.parents[2]
SKILL_DIRECTORY = REPOSITORY / "skills" / "xyf-easycode-install"
SCRIPT = SKILL_DIRECTORY / "scripts" / "install.py"
TEMPLATE = SKILL_DIRECTORY / "PromptsRules.md"
RUNTIME = TEST_DIRECTORY / ".runtime-prompts-rules"

spec = importlib.util.spec_from_file_location("easycode_installer", SCRIPT)
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class PromptsRulesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not RUNTIME.resolve().is_relative_to(TEST_DIRECTORY):
            raise RuntimeError("Runtime directory escaped the designated test directory")
        RUNTIME.mkdir(exist_ok=True)

    @classmethod
    def tearDownClass(cls):
        RUNTIME.rmdir()

    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="case-", dir=RUNTIME)
        self.base = Path(temporary.name).resolve()
        if not self.base.is_relative_to(RUNTIME.resolve()):
            raise RuntimeError("Test directory escaped its designated workspace")
        self.addCleanup(temporary.cleanup)
        self.project = self.base / "目标 项目"
        self.workspace = self.project / "docs" / "xyf-easycode"
        self.rules = self.workspace / "PromptsRules.md"
        self.editor = self.workspace / "html"

    def run_cli(self, *options, script=SCRIPT, expected_code=0):
        environment = dict(os.environ)
        environment.update(
            PYTHONDONTWRITEBYTECODE="1", TEMP=str(self.base),
            TMP=str(self.base), TMPDIR=str(self.base),
        )
        result = subprocess.run(
            [sys.executable, "-B", "-X", "utf8", str(script),
             "--project", str(self.project), *options],
            cwd=self.base, env=environment, capture_output=True,
            text=True, encoding="utf-8", check=False,
        )
        self.assertEqual(result.returncode, expected_code, result.stdout + result.stderr)
        if expected_code == 2:
            self.assertIn("--rules-only", result.stderr)
            return None
        report = json.loads(result.stdout)
        self.assertEqual(report["status"] == "error", expected_code != 0)
        return report

    def deployed_editor(self):
        shutil.copytree(SKILL_DIRECTORY / "html", self.editor)

    def package(self):
        copied_script = self.base / "installed skills" / "xyf-easycode-install" / "scripts" / "install.py"
        copied_script.parent.mkdir(parents=True)
        shutil.copy2(SCRIPT, copied_script)
        return copied_script, copied_script.parent.parent / "PromptsRules.md"

    def write_project_rules(self, data):
        self.rules.parent.mkdir(parents=True, exist_ok=True)
        self.rules.write_bytes(data)

    def test_rules_only_copies_exact_bytes_without_creating_editor(self):
        report = self.run_cli("--rules-only")
        self.assertEqual(self.rules.read_bytes(), TEMPLATE.read_bytes())
        self.assertEqual(report["rules"]["status"], "installed")
        self.assertEqual(Path(report["rules"]["path"]), self.rules)
        self.assertEqual(report["editor_status"], "not_requested")
        self.assertFalse(self.editor.exists())

    def test_repeated_install_preserves_existing_file_and_mtime(self):
        self.run_cli("--rules-only")
        os.utime(self.rules, (1_600_000_000, 1_600_000_000))
        before = self.rules.stat().st_mtime_ns
        report = self.run_cli("--rules-only")
        self.assertEqual(report["status"], "skipped")
        self.assertEqual(report["rules"]["status"], "preserved")
        self.assertEqual(self.rules.stat().st_mtime_ns, before)
        self.assertEqual(self.rules.read_bytes(), TEMPLATE.read_bytes())

    def test_project_custom_rules_are_preserved_byte_for_byte(self):
        custom = "\ufeff# 项目自己的规则\r\n保持原文。\r\n".encode("utf-8")
        self.write_project_rules(custom)
        report = self.run_cli("--rules-only")
        self.assertEqual(report["rules"]["status"], "preserved")
        self.assertEqual(self.rules.read_bytes(), custom)

    def test_first_webpage_install_also_installs_rules(self):
        report = self.run_cli("--language", "zh")
        self.assertEqual(report["editor_status"], "installed")
        self.assertTrue((self.editor / "index.html").is_file())
        self.assertTrue((self.editor / "assert" / "styles.js").is_file())
        self.assertEqual(self.rules.read_bytes(), TEMPLATE.read_bytes())

    def test_complete_webpage_receives_missing_rules_without_language_setup(self):
        self.deployed_editor()
        language = self.editor / "language.js"
        language.write_bytes(b"existing custom language file")
        report = self.run_cli()
        self.assertEqual(report["status"], "installed")
        self.assertEqual(report["editor_status"], "skipped")
        self.assertEqual(report["copied"], 0)
        self.assertEqual(language.read_bytes(), b"existing custom language file")
        self.assertEqual(self.rules.read_bytes(), TEMPLATE.read_bytes())

    def test_complete_webpage_and_rules_are_skipped(self):
        self.deployed_editor()
        self.write_project_rules(b"# Existing project rules\n")
        report = self.run_cli()
        self.assertEqual(report["status"], "skipped")
        self.assertEqual(report["editor_status"], "skipped")
        self.assertEqual(report["rules"]["status"], "preserved")

    def test_incomplete_webpage_is_repaired_without_overwriting_rules(self):
        self.deployed_editor()
        (self.editor / "assert" / "styles.js").unlink()
        custom = b"# Keep my project rules\n"
        self.write_project_rules(custom)
        report = self.run_cli()
        self.assertEqual(report["editor_status"], "installed")
        self.assertTrue((self.editor / "assert" / "styles.js").is_file())
        self.assertEqual(self.rules.read_bytes(), custom)

    def test_rules_directory_conflict_prevents_webpage_writes(self):
        self.rules.mkdir(parents=True)
        report = self.run_cli("--language", "zh", expected_code=1)
        self.assertIn("conflict", report["error"])
        self.assertTrue(self.rules.is_dir())
        self.assertFalse(self.editor.exists())

    def test_empty_or_invalid_project_rules_are_preserved_and_reported(self):
        for data in (b" \r\n\t", b"\xff\xfeinvalid"):
            with self.subTest(data=data):
                self.write_project_rules(data)
                self.run_cli("--language", "zh", expected_code=1)
                self.assertEqual(self.rules.read_bytes(), data)
                self.assertFalse(self.editor.exists())

    def test_missing_template_is_reported_before_any_deployment(self):
        copied_script, _ = self.package()
        report = self.run_cli("--rules-only", script=copied_script, expected_code=1)
        self.assertIn("template", report["error"])
        self.assertFalse(self.project.exists())

    def test_empty_or_invalid_template_is_reported_before_any_deployment(self):
        copied_script, copied_template = self.package()
        for data in (b"", b"\xff"):
            with self.subTest(data=data):
                copied_template.write_bytes(data)
                self.run_cli("--rules-only", script=copied_script, expected_code=1)
                self.assertFalse(self.project.exists())

    def test_packaged_installer_uses_its_own_template_without_html(self):
        copied_script, copied_template = self.package()
        custom = "# 安装目录中的模板\n".encode("utf-8")
        copied_template.write_bytes(custom)
        self.run_cli("--rules-only", script=copied_script)
        self.assertEqual(self.rules.read_bytes(), custom)
        self.assertFalse((copied_template.parent / "html").exists())

    def test_parent_file_conflict_does_not_modify_that_file(self):
        self.project.mkdir()
        docs = self.project / "docs"
        docs.write_bytes(b"existing file")
        self.run_cli("--rules-only", expected_code=1)
        self.assertEqual(docs.read_bytes(), b"existing file")

    def test_webpage_validation_failure_does_not_create_rules(self):
        self.run_cli(expected_code=1)
        self.assertFalse(self.rules.exists())
        self.assertFalse(self.editor.exists())

    def test_rules_only_rejects_language_options_without_writing(self):
        self.run_cli("--rules-only", "--language", "zh", expected_code=2)
        self.assertFalse(self.project.exists())

    def test_concurrent_rules_creation_is_preserved_and_returns_failure(self):
        publish = installer.publish_missing_file
        custom = b"# Concurrent project edit\n"

        def concurrent_publish(destination, data):
            if destination.name == "PromptsRules.md":
                destination.write_bytes(custom)
            publish(destination, data)

        output = io.StringIO()
        with patch.object(installer, "publish_missing_file", side_effect=concurrent_publish):
            with patch.object(sys, "argv", [str(SCRIPT), "--project", str(self.project), "--language", "zh"]):
                with redirect_stdout(output):
                    code = installer.main()
        report = json.loads(output.getvalue())
        self.assertEqual(code, 1)
        self.assertEqual(report["status"], "error")
        self.assertEqual(report["rules"]["status"], "error")
        self.assertEqual(self.rules.read_bytes(), custom)

    def test_rule_symlink_does_not_modify_its_target(self):
        external = self.base / "other_rules.md"
        external.write_bytes(b"# Unrelated rules\n")
        self.rules.parent.mkdir(parents=True)
        try:
            self.rules.symlink_to(external)
        except OSError as error:
            self.skipTest("Symlink creation is unavailable: " + str(error))
        self.run_cli("--rules-only", expected_code=1)
        self.assertEqual(external.read_bytes(), b"# Unrelated rules\n")
        self.assertTrue(self.rules.is_symlink())


if __name__ == "__main__":
    unittest.main(verbosity=2)
