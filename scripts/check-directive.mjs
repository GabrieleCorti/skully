// Fails the build if a core bundle lost its 'use client' directive (needed for RSC).
import { readFileSync } from 'node:fs'

const files = ['dist/index.js', 'dist/index.cjs']
const prologue = /^(?:\s*(?:"[^"]*"|'[^']*');?)*/

for (const file of files) {
  const [head] = readFileSync(file, 'utf8').match(prologue)
  if (!/["']use client["']/.test(head)) {
    console.error(`${file} is missing the "use client" directive`)
    process.exit(1)
  }
}
console.log('"use client" directive present in', files.join(', '))
