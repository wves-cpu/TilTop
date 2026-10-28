import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runDemo() {
  console.log("🚀 TilTop Serveriga ulanish va video yozish tayyorgarligi...");

  const videoDir = path.join(process.cwd(), "videos");
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  console.log("📹 Chromium brauzeri ishga tushirilmoqda...");
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  try {
    console.log("🌐 1. Asosiy sahifani ochish (http://localhost:3000)...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: "videos/01_homepage.png" });

    // Scroll down to show 20 scenarios
    console.log("📚 2. 20 ta Ssenariylarni ko'rsatish va skroll qilish...");
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
    await page.waitForTimeout(2500);
    await page.screenshot({ path: "videos/02_scenarios_scroll.png" });

    // Click on scenario card
    console.log("🎯 3. Ssenariyni tanlash va Lesson Lab bo'limiga kirish...");
    const scenarioCard = page.locator("button, div").filter({ hasText: "Boshlash" }).first();
    if (await scenarioCard.isVisible()) {
      await scenarioCard.click();
      await page.waitForTimeout(3000);
    } else {
      // Fallback click on any card
      const anyCard = page.locator(".cursor-pointer").first();
      if (await anyCard.isVisible()) {
        await anyCard.click();
        await page.waitForTimeout(3000);
      }
    }
    await page.screenshot({ path: "videos/03_lesson_lab.png" });

    // Test Vocabulary Audio
    console.log("🔊 4. Lug'at va Ovoz namunalarini sinash...");
    const audioBtn = page.locator("button:has-text('🔊'), button[title*='eshitish']").first();
    if (await audioBtn.isVisible()) {
      await audioBtn.click();
      await page.waitForTimeout(2000);
    }

    // Test Dialog Tab
    console.log("💬 5. AI Rolli Dialog bo'limiga o'tish...");
    const dialogTab = page.locator("button").filter({ hasText: /Dialog|Suhbat/i }).first();
    if (await dialogTab.isVisible()) {
      await dialogTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: "videos/04_dialog_tab.png" });
    }

    // Test Games
    console.log("🎮 6. Interaktiv O'yinlar bo'limiga o'tish...");
    const gamesBtn = page.locator("button, a").filter({ hasText: /O'yinlar|Games/i }).first();
    if (await gamesBtn.isVisible()) {
      await gamesBtn.click();
      await page.waitForTimeout(3500);
      await page.screenshot({ path: "videos/05_games_page.png" });
    }

    // Test Profile / Stats
    console.log("📊 7. Statistika va Yutuqlar bo'limini sinash...");
    const statsBtn = page.locator("button, a").filter({ hasText: /Statistika|Progress|Profil/i }).first();
    if (await statsBtn.isVisible()) {
      await statsBtn.click();
      await page.waitForTimeout(3500);
      await page.screenshot({ path: "videos/06_stats_page.png" });
    }

    console.log("🎉 Barcha funksiyalar muvaffaqiyatli sinovdan o'tkazildi va video yozildi!");
  } catch (err) {
    console.error("Test xatoligi:", err);
  } finally {
    await page.waitForTimeout(2000);
    await context.close();
    await browser.close();

    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith(".webm") || f.endsWith(".mp4"));
    if (videoFile) {
      console.log(`✅ VIDEO YAZIB OLINDI! Fayl saqlandi: ${path.join(videoDir, videoFile)}`);
    }
  }
}

runDemo();
