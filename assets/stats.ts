export default (count) => `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="84"
  height="20"
  role="img"
  aria-label="Played: ${count} times"
>
  <title>Played: ${count} times</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r">
    <rect width="84" height="20" rx="3" fill="#fff" />
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="35" height="20" fill="#555" />
    <rect x="35" width="49" height="20" fill="#4c1" />
    <rect width="84" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="185"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="250"
    >
      Played
    </text>
    <text x="185" y="140" transform="scale(.1)" fill="#fff" textLength="250">
      Played
    </text>
    <text
      aria-hidden="true"
      x="585"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="390"
    >
      ${count} times
    </text>
    <text x="585" y="140" transform="scale(.1)" fill="#fff" textLength="390">
      ${count} times
    </text>
  </g>
</svg>`;
