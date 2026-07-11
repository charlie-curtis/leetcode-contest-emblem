export async function renderPng(svg) {
  const { Resvg } = await import('@resvg/resvg-js');
  const renderer = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1640
    },
    font: {
      loadSystemFonts: true
    }
  });

  return renderer.render().asPng();
}
