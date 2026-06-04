import fs from "fs";
import path from "path";

const blocksDir = path.join(process.cwd(), "extensions", "premium-hero-extension", "blocks");
const files = fs.readdirSync(blocksDir);

for (const file of files) {
  if (!file.endsWith(".liquid")) continue;

  const filePath = path.join(blocksDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes("app.metafields.premium_hero.plan.value")) {
    console.log(`Skipping ${file} (already modified)`);
    continue;
  }

  const isPro = file.endsWith("_pro.liquid");

  const planCheck = isPro 
    ? `{%- assign current_plan = app.metafields.premium_hero.plan.value | default: 'FREE' -%}\n{%- if current_plan == 'PRO' or current_plan == 'PREMIUM' -%}`
    : `{%- assign current_plan = app.metafields.premium_hero.plan.value | default: 'FREE' -%}\n{%- if current_plan == 'PREMIUM' -%}`;

  const planFallback = isPro
    ? `{%- else -%}\n  <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 2rem; text-align: center; border-radius: 8px; font-family: sans-serif; color: #991b1b; margin: 1rem 0;">\n    <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #991b1b;">🔒 Pro Template Locked</h2>\n    <p style="margin: 0; font-size: 0.9rem;">This template requires the Pro or Premium plan. Please upgrade your plan in the Premium Hero Section app to use this design.</p>\n  </div>\n{%- endif -%}`
    : `{%- else -%}\n  <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 2rem; text-align: center; border-radius: 8px; font-family: sans-serif; color: #991b1b; margin: 1rem 0;">\n    <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #991b1b;">🔒 Premium Template Locked</h2>\n    <p style="margin: 0; font-size: 0.9rem;">This template requires the Premium plan. Please upgrade your plan in the Premium Hero Section app to use this design.</p>\n  </div>\n{%- endif -%}`;

  // Replace top
  content = content.replace(
    /{%- assign template_id = block\.settings\.template_id -%}\r?\n\r?\n<div/g,
    `{%- assign template_id = block.settings.template_id -%}\n\n${planCheck}\n\n<div`
  );

  // Replace bottom
  content = content.replace(
    /<\/div>\r?\n\r?\n{% schema %}/g,
    `</div>\n\n${planFallback}\n\n{% schema %}`
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Modified ${file}`);
}
