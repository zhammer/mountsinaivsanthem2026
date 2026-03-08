import { TESTIMONIALS } from "../src/testimonials";

const seen = new Map<string, number>();
let dupes = 0;

for (let i = 0; i < TESTIMONIALS.length; i++) {
  const msg = TESTIMONIALS[i].message.trim().toLowerCase();
  if (seen.has(msg)) {
    dupes++;
    console.log(`Duplicate found:`);
    console.log(`  Index ${seen.get(msg)!} and ${i}`);
    console.log(`  "${TESTIMONIALS[i].message.slice(0, 80)}..."\n`);
  } else {
    seen.set(msg, i);
  }
}

if (dupes === 0) {
  console.log(`No duplicates found among ${TESTIMONIALS.length} testimonials.`);
} else {
  console.log(`${dupes} duplicate(s) found among ${TESTIMONIALS.length} testimonials.`);
  process.exit(1);
}
