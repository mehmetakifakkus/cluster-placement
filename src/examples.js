import { parseFileList } from './core/parse';

// Ready-made file lists for the example picker. Sizes are typical values for
// such files; a line without a size stands for a file whose size the browser
// cannot read (e.g. .ai, .psd, .3dm).
const list = (text) =>
  parseFileList(text).map((f) => ({ ...f, sizeSource: f.width ? 'text' : 'unknown', thumbUrl: null }));

export const EXAMPLES = [
  {
    id: 'design',
    title: 'Tasarım projesi',
    files: list(`design1.ai, 1200, 1600
design2.ai, 2400, 1600
design3.ai, 120, 80
renderdesign1.png, 800, 800
renderdesign2.png, 400, 400
renderdesign3.png, 1000, 1000
renderdesign4.png, 1200, 1200
sketchv1.jpeg, 800, 400
sketchv2.jpeg, 240, 120
sketchv3.jpeg, 360, 180`),
  },
  {
    id: 'photos',
    title: 'Fotoğraf serisi',
    files: list(`idea.docx
5653.jpeg, 4000, 3000
5654.jpeg, 4000, 3000
5655.jpeg, 3000, 4000
5656.jpeg, 4000, 3000
5657.jpeg, 4000, 3000
5658.jpeg, 3000, 4000
5659.jpeg, 4000, 3000
5660.jpeg, 4000, 3000
5661.jpeg, 4000, 3000
5662.jpeg, 3000, 4000
5663.psd
5660_e1.psd
5660_e2.psd
5660_e3.psd
5660_e4.psd
model1.3dm
model2.3dm
model3.3dm
modelmanu1.3dm
modelmanu2.3dm
modelmanu3.3dm
renderdesign4.png, 1200, 1200
sketchv1.jpeg, 800, 400
sketchv2.jpeg, 240, 120
sketchv3.jpeg, 360, 180`),
  },
  {
    id: 'mixed',
    title: 'Karışık klasör',
    files: list(`brief.pdf
logo.ai
logo_dark.ai
moodboard.psd
photo_01.jpg, 4000, 3000
photo_02.jpg, 3000, 4000
photo_03.jpg, 4000, 3000
photo_10.jpg, 1920, 1080
banner_web.png, 1920, 600
banner_mobile.png, 1080, 1920
notes.txt`),
  },
];
