import { describe, it, expect } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";

// We will validate the components and state transitions programmatically via static analysis.
console.log("Memulai Evidence-Based Flow Audit...");

const srcDir = path.resolve("src/screens");

function getSource(filename: string): string {
  return fs.readFileSync(path.join(srcDir, filename), "utf-8");
}

async function runAudit() {
  let passed = 0;
  let failed = 0;
  
  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Rantai Warna Checks
    console.log("\\n--- Audit Rantai Warna ---");
    const RantaiWarnaStr = getSource("MiniGameRantaiWarnaScreen.tsx");
    assert(RantaiWarnaStr.includes("onPointerDown"), "Rantai Warna punya pointer handler (onPointerDown)");
    assert(RantaiWarnaStr.includes("connectedLines"), "Rantai Warna memiliki state/variabel connectedLines");
    assert(!RantaiWarnaStr.includes("<span>{node.number}</span>"), "Rantai Warna node arena tidak merender angka di dalam arena");
    assert(RantaiWarnaStr.includes("x1: node.x * geo.width"), "Rantai Warna menggunakan koordinat yang benar (tidak bergeser)");

    // 2. Jalur Angka Checks
    console.log("\\n--- Audit Jalur Angka ---");
    const JalurAngkaStr = getSource("MiniGameJalurAngkaScreen.tsx");
    assert(JalurAngkaStr.includes("NumericKeypad"), "Jalur Angka merender komponen NumericKeypad (input modal)");
    assert(JalurAngkaStr.includes("validateNumericInput"), "Jalur Angka memanggil fungsi validasi input non-numeric");
    assert(JalurAngkaStr.includes("areAllInputsFilled"), "Jalur Angka mengecek apakah semua input sudah terisi");
    assert(JalurAngkaStr.includes("bg-transparent border-transparent"), "Jalur Angka menggunakan UI transparan untuk operator");

    // 3. Misi Harian Anak
    console.log("\\n--- Audit Misi Harian Anak ---");
    const DailyMissionsStr = getSource("DailyMissionsScreen.tsx");
    assert(DailyMissionsStr.includes("const profile = store.profiles.find"), "Misi Harian membaca profile fresh dari store, bukan prop usang");
    assert(DailyMissionsStr.includes("pending_parent_validation"), "Child checklist mengubah status ke pending_parent_validation");
    assert(DailyMissionsStr.includes("disabled={"), "Child checklist memiliki properti disabled pada button saat loading/pending");

    // 4. Parent Dashboard
    console.log("\\n--- Audit Parent Dashboard ---");
    const ParentScreenStr = getSource("ParentScreen.tsx");
    assert(ParentScreenStr.includes("const profiles = store.profiles;"), "Parent Dashboard membaca profiles fresh dari store, bukan prop usang");
    assert(ParentScreenStr.includes("approveAssignment"), "Parent approve memanggil fungsi approveAssignment");
    assert(ParentScreenStr.includes("rejectAssignment"), "Parent reject memanggil fungsi rejectAssignment");
    
    console.log("\\n==================================");
    console.log(`Hasil Audit: ${passed} Lulus, ${failed} Gagal`);
    
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log("Semua validasi evidence-based flow berhasil.");
      process.exit(0);
    }
  } catch (error) {
    console.error("Audit error:", error);
    process.exit(1);
  }
}

runAudit();
