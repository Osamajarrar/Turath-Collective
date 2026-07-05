#!/usr/bin/env node

import { execSync } from "child_process";

const EXPECTED_EMAIL = "osamajarrar8@gmail.com";
const EXPECTED_NAME = "Osama Jarrar";

function getGitConfig(key) {
  try {
    return execSync(`git config ${key}`, { stdio: "pipe" }).toString().trim();
  } catch {
    return null;
  }
}

function setGitConfig(key, value) {
  execSync(`git config ${key} "${value}"`, { stdio: "pipe" });
}

let fixed = false;

const currentEmail = getGitConfig("user.email");
if (currentEmail !== EXPECTED_EMAIL) {
  setGitConfig("user.email", EXPECTED_EMAIL);
  fixed = true;
}

const currentName = getGitConfig("user.name");
if (currentName !== EXPECTED_NAME) {
  setGitConfig("user.name", EXPECTED_NAME);
  fixed = true;
}

if (fixed) {
  console.log(`🔧 Git user corrected → ${EXPECTED_NAME} <${EXPECTED_EMAIL}>`);
} else {
  console.log(`✅ Git user verified (${EXPECTED_EMAIL})`);
}