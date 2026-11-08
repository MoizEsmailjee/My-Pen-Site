export type NibOption = 'Fine' | 'Medium';

export interface ProductVariant {
  id: string;
  label: string;
  sublabel: string;
  swatchHex?: string;
  strokeWidthPx?: number;
  image?: string;
  colorFamily?: string;
  nibEngraving?: string;
}

export interface Product {
  id: string;
  name: string;
  japaneseTitle: string;
  category: 'Fountain Pens' | 'Bottled Inks' | 'Converters & Refills';
  priceKes: number;
  image: string;
  galleryImages?: { src: string; caption: string }[];
  imageFit?: 'cover' | 'contain';
  hasNibSelector?: boolean;
  availableNibs?: NibOption[];
  Origin: string;
  availability: string;
  shortSummary: string;
  description: string;
  variantLabel: string;
  variants: ProductVariant[];
  specs: {
    label: string;
    value: string;
  }[];
  includedItems: string[];
}

export interface InkShadeOption {
  id: string;
  name: string;
  kanji: string;
  meaning: string;
  colorFamily:
    | 'Blues & Teals'
    | 'Reds, Pinks & Purples'
    | 'Greens & Golds'
    | 'Blacks, Greys & Browns';
  hex: string;
  secondaryHex: string;
  sheenNote: string;
  image: string;
  swatchImage: string;
}

export const INK_STUDIO_SHADES: InkShadeOption[] = [
  {
    id: 'iroshizuku-ama-iro',
    name: 'Ama-iro',
    kanji: '天色',
    meaning: 'Sky Blue',
    colorFamily: 'Blues & Teals',
    hex: '#1582B5',
    secondaryHex: '#3AA3D4',
    sheenNote: 'Radiant high-altitude sky blue with crisp, cheerful shading and vibrant swatch clarity',
    image: '/assets/iroshizuku/ama_iro.jpg',
    swatchImage: '/assets/iroshizuku/ama_iro_swatch.jpg',
  },
  {
    id: 'iroshizuku-kon-peki',
    name: 'Kon-peki',
    kanji: '紺碧',
    meaning: 'Deep Cerulean Blue',
    colorFamily: 'Blues & Teals',
    hex: '#0F5C8C',
    secondaryHex: '#227AB3',
    sheenNote: 'Vibrant summer azure with luminous shading and subtle red edge sheen',
    image: '/assets/iroshizuku/kon_peki.jpg',
    swatchImage: '/assets/iroshizuku/kon_peki_swatch.jpg',
  },
  {
    id: 'iroshizuku-tsuki-yo',
    name: 'Tsuki-yo',
    kanji: '月夜',
    meaning: 'Moonlight Night Sky',
    colorFamily: 'Blues & Teals',
    hex: '#12465E',
    secondaryHex: '#1D6280',
    sheenNote: 'Deep oceanic teal-blue with subtle crimson-copper edge sheen',
    image: '/assets/iroshizuku/tsuki_yo.jpg',
    swatchImage: '/assets/iroshizuku/tsuki_yo_swatch.jpg',
  },
  {
    id: 'iroshizuku-shin-kai',
    name: 'Shin-kai',
    kanji: '深海',
    meaning: 'Deep Sea Blue-Black',
    colorFamily: 'Blues & Teals',
    hex: '#1F344D',
    secondaryHex: '#355070',
    sheenNote: 'Refined abyssal blue-black with velvety coppery-red sheen on wet nibs',
    image: '/assets/iroshizuku/shin_kai.jpg',
    swatchImage: '/assets/iroshizuku/shin_kai_swatch.jpg',
  },
  {
    id: 'iroshizuku-asa-gao',
    name: 'Asa-gao',
    kanji: '朝顔',
    meaning: 'Morning Glory Blue',
    colorFamily: 'Blues & Teals',
    hex: '#1E3F8F',
    secondaryHex: '#345BB8',
    sheenNote: 'Rich royal cobalt blue inspired by dewy summer morning glory petals',
    image: '/assets/iroshizuku/asa_gao.jpg',
    swatchImage: '/assets/iroshizuku/asa_gao_swatch.jpg',
  },
  {
    id: 'iroshizuku-ku-jaku',
    name: 'Ku-jaku',
    kanji: '孔雀',
    meaning: 'Peacock Teal',
    colorFamily: 'Blues & Teals',
    hex: '#0D626E',
    secondaryHex: '#1B8391',
    sheenNote: 'Opulent peacock-feather emerald teal with burgundy sheen highlights',
    image: '/assets/iroshizuku/ku_jaku.jpg',
    swatchImage: '/assets/iroshizuku/ku_jaku_swatch.jpg',
  },
  {
    id: 'iroshizuku-syo-ro',
    name: 'Syo-ro',
    kanji: '松露',
    meaning: 'Dew on Pine Tree',
    colorFamily: 'Blues & Teals',
    hex: '#195E59',
    secondaryHex: '#297E78',
    sheenNote: 'Goes down blue and dries to a deep pine-needle teal with maroon sheen',
    image: '/assets/iroshizuku/syo_ro.jpg',
    swatchImage: '/assets/iroshizuku/syo_ro_swatch.jpg',
  },
  {
    id: 'iroshizuku-ajisai',
    name: 'Ajisai',
    kanji: '紫陽花',
    meaning: 'Hydrangea Periwinkle',
    colorFamily: 'Blues & Teals',
    hex: '#4A5CA8',
    secondaryHex: '#697BC4',
    sheenNote: 'Delicate cornflower-periwinkle blue with soft lavender undertones',
    image: '/assets/iroshizuku/ajisai.jpg',
    swatchImage: '/assets/iroshizuku/ajisai_swatch.jpg',
  },
  {
    id: 'iroshizuku-rikka',
    name: 'Rikka',
    kanji: '六花',
    meaning: 'Snow Crystal Blue',
    colorFamily: 'Blues & Teals',
    hex: '#286684',
    secondaryHex: '#4689A8',
    sheenNote: 'Crystalline winter glacier blue with crisp shading and serene clarity',
    image: '/assets/iroshizuku/rikka.jpg',
    swatchImage: '/assets/iroshizuku/rikka_swatch.jpg',
  },
  {
    id: 'iroshizuku-yama-budo',
    name: 'Yama-budo',
    kanji: '山葡萄',
    meaning: 'Crimson Wild Grapes',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#6A1E47',
    secondaryHex: '#8E2B61',
    sheenNote: 'Regal burgundy-plum with antique gold sheen on cotton paper',
    image: '/assets/iroshizuku/yama_budo.jpg',
    swatchImage: '/assets/iroshizuku/yama_budo_swatch.jpg',
  },
  {
    id: 'iroshizuku-momiji',
    name: 'Momiji',
    kanji: '紅葉',
    meaning: 'Autumn Maple Leaves',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#B3243B',
    secondaryHex: '#D43B54',
    sheenNote: 'Brilliant Japanese autumn maple vermilion-cerise with bright golden sheen',
    image: '/assets/iroshizuku/momiji.jpg',
    swatchImage: '/assets/iroshizuku/momiji_swatch.jpg',
  },
  {
    id: 'iroshizuku-murasaki-shikibu',
    name: 'Murasaki-shikibu',
    kanji: '紫式部',
    meaning: 'Deep Lavender Violet',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#5D3C8A',
    secondaryHex: '#7A56AD',
    sheenNote: 'Poetic imperial violet named after the classical Heian novelist',
    image: '/assets/iroshizuku/murasaki_shikibu.jpg',
    swatchImage: '/assets/iroshizuku/murasaki_shikibu_swatch.jpg',
  },
  {
    id: 'iroshizuku-hana-ikada',
    name: 'Hana-ikada',
    kanji: '花筏',
    meaning: 'Japanese Cherry Blossom',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#D4728C',
    secondaryHex: '#E892A9',
    sheenNote: 'Soft pastel sakura petals floating on spring river currents',
    image: '/assets/iroshizuku/hana_ikada.jpg',
    swatchImage: '/assets/iroshizuku/hana_ikada_swatch.jpg',
  },
  {
    id: 'iroshizuku-syun-gyo',
    name: 'Syun-gyo',
    kanji: '春暁',
    meaning: 'Spring Dawn Burgundy',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#694454',
    secondaryHex: '#8A5D70',
    sheenNote: 'Atmospheric dusky plum-rose inspired by the first light of a spring morning',
    image: '/assets/iroshizuku/syun_gyo.jpg',
    swatchImage: '/assets/iroshizuku/syun_gyo_swatch.jpg',
  },
  {
    id: 'iroshizuku-fuyu-gaki',
    name: 'Fuyu-gaki',
    kanji: '冬柿',
    meaning: 'Winter Persimmon Orange',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#C84428',
    secondaryHex: '#E05E42',
    sheenNote: 'Warm ripe persimmon coral-red with expressive shading',
    image: '/assets/iroshizuku/fuyu_gaki.jpg',
    swatchImage: '/assets/iroshizuku/fuyu_gaki_swatch.jpg',
  },
  {
    id: 'iroshizuku-yu-yake',
    name: 'Yu-yake',
    kanji: '夕焼け',
    meaning: 'Sunset Horizon Orange',
    colorFamily: 'Reds, Pinks & Purples',
    hex: '#D15B26',
    secondaryHex: '#EB7842',
    sheenNote: 'Glowing twilight tangerine-amber with dramatic light-to-dark shading',
    image: '/assets/iroshizuku/yu_yake.jpg',
    swatchImage: '/assets/iroshizuku/yu_yake_swatch.jpg',
  },
  {
    id: 'iroshizuku-to-ro',
    name: 'To-ro',
    kanji: '燈路',
    meaning: 'Warm Lantern Amber',
    colorFamily: 'Greens & Golds',
    hex: '#E08A1E',
    secondaryHex: '#F2A53D',
    sheenNote: 'Golden-honey lantern glow with rich warm amber shading on fountain pen paper',
    image: '/assets/iroshizuku/to_ro.jpg',
    swatchImage: '/assets/iroshizuku/to_ro_swatch.jpg',
  },
  {
    id: 'iroshizuku-shin-ryoku',
    name: 'Shin-ryoku',
    kanji: '深緑',
    meaning: 'Deep Forest Green',
    colorFamily: 'Greens & Golds',
    hex: '#145C3E',
    secondaryHex: '#237D57',
    sheenNote: 'Lush old-growth Japanese cedar emerald green with subtle red sheen',
    image: '/assets/iroshizuku/shin_ryoku.jpg',
    swatchImage: '/assets/iroshizuku/shin_ryoku_swatch.jpg',
  },
  {
    id: 'iroshizuku-chiku-rin',
    name: 'Chiku-rin',
    kanji: '竹林',
    meaning: 'Bamboo Forest Green',
    colorFamily: 'Greens & Golds',
    hex: '#5F8D37',
    secondaryHex: '#7CAD51',
    sheenNote: 'Sun-dappled Arashiyama bamboo leaf green with organic shading',
    image: '/assets/iroshizuku/chiku_rin.jpg',
    swatchImage: '/assets/iroshizuku/chiku_rin_swatch.jpg',
  },
  {
    id: 'iroshizuku-sui-gyoku',
    name: 'Sui-gyoku',
    kanji: '翠玉',
    meaning: 'Emerald Gemstones',
    colorFamily: 'Greens & Golds',
    hex: '#117864',
    secondaryHex: '#1F9C84',
    sheenNote: 'Vivid jewel-toned imperial jade emerald with crisp line definition',
    image: '/assets/iroshizuku/sui_gyoku.jpg',
    swatchImage: '/assets/iroshizuku/sui_gyoku_swatch.jpg',
  },
  {
    id: 'iroshizuku-hotaru-bi',
    name: 'Hotaru-bi',
    kanji: '蛍火',
    meaning: 'Light of Fireflies',
    colorFamily: 'Greens & Golds',
    hex: '#8BA622',
    secondaryHex: '#A7C435',
    sheenNote: 'Luminous summer firefly chartreuse-yellow with golden-green shading',
    image: '/assets/iroshizuku/hotaru_bi.jpg',
    swatchImage: '/assets/iroshizuku/hotaru_bi_swatch.jpg',
  },
  {
    id: 'iroshizuku-take-sumi',
    name: 'Take-sumi',
    kanji: '竹炭',
    meaning: 'Bamboo Charcoal Black',
    colorFamily: 'Blacks, Greys & Browns',
    hex: '#1D1E20',
    secondaryHex: '#3A3C40',
    sheenNote: 'Dense, velvety sumi-inspired black with subtle bronze lustre',
    image: '/assets/iroshizuku/take_sumi.jpg',
    swatchImage: '/assets/iroshizuku/take_sumi_swatch.jpg',
  },
  {
    id: 'iroshizuku-fuyu-syogun',
    name: 'Fuyu-syogun',
    kanji: '冬将軍',
    meaning: 'Snowy Season Cool Grey',
    colorFamily: 'Blacks, Greys & Browns',
    hex: '#57626E',
    secondaryHex: '#73808F',
    sheenNote: 'Cool steel-cloud winter grey with delicate pencil-like shading',
    image: '/assets/iroshizuku/fuyu_syogun.jpg',
    swatchImage: '/assets/iroshizuku/fuyu_syogun_swatch.jpg',
  },
  {
    id: 'iroshizuku-kiri-same',
    name: 'Kiri-same',
    kanji: '霧雨',
    meaning: 'Scotch Mist Warm Grey',
    colorFamily: 'Blacks, Greys & Browns',
    hex: '#5E5B5A',
    secondaryHex: '#7A7675',
    sheenNote: 'Warm sumi-wash storm grey reminiscent of mountain mist',
    image: '/assets/iroshizuku/kiri_same.jpg',
    swatchImage: '/assets/iroshizuku/kiri_same_swatch.jpg',
  },
  {
    id: 'iroshizuku-yama-guri',
    name: 'Yama-guri',
    kanji: '山栗',
    meaning: 'Wild Chestnut Brown',
    colorFamily: 'Blacks, Greys & Browns',
    hex: '#4A352A',
    secondaryHex: '#694C3D',
    sheenNote: 'Deep roasted espresso-chestnut brown for vintage correspondence',
    image: '/assets/iroshizuku/yama_guri.jpg',
    swatchImage: '/assets/iroshizuku/yama_guri_swatch.jpg',
  },
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'pilot-kakuno-madoromi',
    name: 'PILOT KAKUNO · MADOROMI SERIES',
    japaneseTitle: '万年筆 カクノ まどろみカラー · Limited Slumber Edition',
    category: 'Fountain Pens',
    priceKes: 3500,
    image: '/assets/madoromi/madoromi_series.jpg',
    imageFit: 'cover',
    hasNibSelector: true,
    availableNibs: ['Fine', 'Medium'],
    galleryImages: [
      {
        src: '/assets/madoromi/madoromi_series.jpg',
        caption: 'Madoromi Slumber Series Full Lineup',
      },
      {
        src: '/assets/madoromi/madoromi_ivory.jpg',
        caption: 'Madoromi Ivory · Gold-Tone Steel Nib',
      },
      {
        src: '/assets/madoromi/madoromi_blue.jpg',
        caption: 'Madoromi Drowsy Blue',
      },
      {
        src: '/assets/madoromi/madoromi_pink.jpg',
        caption: 'Madoromi Slumber Pink',
      },
      {
        src: '/assets/madoromi/madoromi_brown.jpg',
        caption: 'Madoromi Calm Brown',
      },
      {
        src: '/assets/madoromi/madoromi_lightblue.jpg',
        caption: 'Madoromi Light Blue',
      },
      {
        src: '/assets/madoromi/madoromi_nib_detail.jpg',
        caption: 'All 5 Translucent Madoromi Shades',
      },
    ],
    Origin: 'Made in Japan',
    availability: 'Limited Edition · In Stock',
    shortSummary:
      'Dreamy translucent pastel barrels paired with a warm gold-finished stainless steel nib in Fine or Medium.',
    description:
      'The Pilot Kakuno Madoromi ("Slumber") Series is a special limited-edition release inspired by quiet, restful twilight moments. Unlike the standard Kakuno, each Madoromi pen features a soothing translucent pearlescent barrel and cap paired with an elegant gold-colored stainless steel nib in your choice of Fine (0.35mm) or Medium (0.50mm).',
    variantLabel: 'Select Madoromi Color',
    variants: [
      {
        id: 'madoromi-ivory',
        label: 'Madoromi Ivory',
        sublabel: 'Soft milky ivory translucent barrel with gold-tone smiley nib',
        swatchHex: '#F3EFE6',
        strokeWidthPx: 2.0,
        image: '/assets/madoromi/madoromi_ivory.jpg',
        nibEngraving: 'Gold-Tone Smiley Nib',
      },
      {
        id: 'madoromi-blue',
        label: 'Madoromi Blue',
        sublabel: 'Serene twilight periwinkle blue with gold-tone steel nib',
        swatchHex: '#7A91BA',
        strokeWidthPx: 2.0,
        image: '/assets/madoromi/madoromi_blue.jpg',
        nibEngraving: 'Gold-Tone Smiley Nib',
      },
      {
        id: 'madoromi-pink',
        label: 'Madoromi Pink',
        sublabel: 'Warm dusty rose blush with translucent grip section',
        swatchHex: '#DAB2AB',
        strokeWidthPx: 2.0,
        image: '/assets/madoromi/madoromi_pink.jpg',
        nibEngraving: 'Gold-Tone Smiley Nib',
      },
      {
        id: 'madoromi-brown',
        label: 'Madoromi Brown',
        sublabel: 'Muted taupe-cocoa translucent finish with gold-tone nib',
        swatchHex: '#9A8B88',
        strokeWidthPx: 2.0,
        image: '/assets/madoromi/madoromi_brown.jpg',
        nibEngraving: 'Gold-Tone Smiley Nib',
      },
      {
        id: 'madoromi-lightblue',
        label: 'Madoromi Light Blue',
        sublabel: 'Airy morning-mist sky blue with gold-tone steel nib',
        swatchHex: '#A7C7DB',
        strokeWidthPx: 2.0,
        image: '/assets/madoromi/madoromi_lightblue.jpg',
        nibEngraving: 'Gold-Tone Smiley Nib',
      },
    ],
    specs: [
      { label: 'Nib Sizes', value: 'Fine (0.35mm) & Medium (0.50mm) Gold-Tone Steel' },
      { label: 'Body & Cap', value: 'Translucent Madoromi Hexagonal Resin (11g)' },
      { label: 'Filling System', value: 'Pilot IC-50 Cartridge Included (CON-40 / CON-70 Compatible)' },
      { label: 'Barcode / SKU', value: 'PFKA-1MDI · Limited Edition Run' },
    ],
    includedItems: [
      'Pilot Kakuno Madoromi Limited Edition Fountain Pen',
      '1× Pilot Black Ink Cartridge (IC-50)',
      'Official Pilot Japan Care & First-Fill Instruction Manual',
    ],
  },
  {
    id: 'pilot-kakuno-family',
    name: 'PILOT KAKUNO · FAMILY SERIES',
    japaneseTitle: '万年筆 カクノ ファミリーシリーズ · Individual Translucent Character Pens',
    category: 'Fountain Pens',
    priceKes: 3000,
    image: '/assets/kakuno_family/family_papa_blue.jpg',
    imageFit: 'contain',
    hasNibSelector: true,
    availableNibs: ['Fine', 'Medium'],
    galleryImages: [
      {
        src: '/assets/kakuno_family/family_papa_blue.jpg',
        caption: 'Papa Blue (Translucent Blue · Mustache & Bow Tie Nib)',
      },
      {
        src: '/assets/kakuno_family/family_mama_red.jpg',
        caption: 'Mama Red (Translucent Coral Red · Eyelashes & Necklace Nib)',
      },
      {
        src: '/assets/kakuno_family/family_boy_green.jpg',
        caption: 'Boy Green (Translucent Aqua · Cheerful Smile Nib)',
      },
      {
        src: '/assets/kakuno_family/family_girl_pink.jpg',
        caption: 'Girl Pink (Translucent Pink · Ribbon Bow Nib)',
      },
      {
        src: '/assets/kakuno_family/family_baby_yellow.jpg',
        caption: 'Baby Yellow (Translucent Lime Yellow · Pacifier Nib)',
      },
      {
        src: '/assets/kakuno_family/family_clear.jpg',
        caption: 'Clear Demonstrator (Crystal Clear · Winking Smiley Nib)',
      },
      {
        src: '/assets/aistudio/image_e53ac4d6.png',
        caption: 'Complete Kakuno Family Series Lineup Chart',
      },
    ],
    Origin: 'Made in Japan',
    availability: 'In Stock in Nairobi',
    shortSummary:
      'Vibrant crystal-clear hexagonal demonstrator barrels, each laser-etched with its own charming family member face on a Fine or Medium nib.',
    description:
      'Created by Pilot Japan to bring joy to writers of every generation, the Kakuno Family Series pairs jewel-toned transparent hexagonal barrels with distinct laser-etched nib expressions: Papa Blue (mustache & bow tie), Mama Red (eyelashes & necklace), Boy Green (cheerful grin), Girl Pink (ribbon bow), Baby Yellow (pacifier), and Clear Demonstrator (winking smiley). Available in both Fine (0.35mm) and Medium (0.50mm) stainless steel nibs.',
    variantLabel: 'Select Family Series Pen (View Individual Photo)',
    variants: [
      {
        id: 'family-papa-blue',
        label: 'Papa Blue',
        sublabel: 'Translucent sapphire blue barrel · Mustache & bow tie nib engraving',
        swatchHex: '#3B78B8',
        strokeWidthPx: 1.8,
        image: '/assets/kakuno_family/family_papa_blue.jpg',
        nibEngraving: 'Papa Face (Mustache & Bow Tie)',
      },
      {
        id: 'family-mama-red',
        label: 'Mama Red',
        sublabel: 'Translucent coral-red barrel · Eyelashes & pearl necklace nib engraving',
        swatchHex: '#F25267',
        strokeWidthPx: 1.8,
        image: '/assets/kakuno_family/family_mama_red.jpg',
        nibEngraving: 'Mama Face (Eyelashes & Necklace)',
      },
      {
        id: 'family-boy-green',
        label: 'Boy Green',
        sublabel: 'Translucent aqua-turquoise barrel · Cheerful boy smile nib engraving',
        swatchHex: '#31C4CE',
        strokeWidthPx: 1.8,
        image: '/assets/kakuno_family/family_boy_green.jpg',
        nibEngraving: 'Boy Face (Cheerful Smile)',
      },
      {
        id: 'family-girl-pink',
        label: 'Girl Pink',
        sublabel: 'Translucent rose-pink barrel · Cute ribbon bow nib engraving',
        swatchHex: '#E87BB1',
        strokeWidthPx: 1.8,
        image: '/assets/kakuno_family/family_girl_pink.jpg',
        nibEngraving: 'Girl Face (Ribbon Bow)',
      },
      {
        id: 'family-baby-yellow',
        label: 'Baby Yellow',
        sublabel: 'Translucent citrus-lime yellow barrel · Baby pacifier nib engraving',
        swatchHex: '#D4E815',
        strokeWidthPx: 1.8,
        image: '/assets/kakuno_family/family_baby_yellow.jpg',
        nibEngraving: 'Baby Face (Pacifier)',
      },
      {
        id: 'family-clear',
        label: 'Clear Demonstrator',
        sublabel: 'Full crystal-clear resin barrel & cap · Classic winking smiley nib',
        swatchHex: '#E2E8F0',
        strokeWidthPx: 1.8,
        image: '/assets/kakuno_family/family_clear.jpg',
        nibEngraving: 'Classic Winking Smiley',
      },
    ],
    specs: [
      { label: 'Nib Options', value: 'Fine (0.35mm) & Medium (0.50mm) Silver Steel' },
      { label: 'Nib Engraving', value: 'Unique Family Character Laser Etching on Every Nib' },
      { label: 'Body & Cap', value: 'Translucent Colored Hexagonal Resin with Clear Grip (11g)' },
      { label: 'Filling System', value: 'Pilot IC-50 Cartridge Included (CON-40 / CON-70 Compatible)' },
    ],
    includedItems: [
      'Pilot Kakuno Family Series Fountain Pen (Selected Character & Nib Size)',
      '1× Pilot Black Ink Cartridge (IC-50)',
      'Illustrated Japanese Nib Orientation & Care Guide',
    ],
  },
  {
    id: 'pilot-prera',
    name: 'PILOT PRERA · EMPRESS TEAL SERIES',
    japaneseTitle: '万年筆 プレラ · Empress Teal & Café Collection',
    category: 'Fountain Pens',
    priceKes: 8500,
    image: '/assets/prera/empress_teal_1.jpg',
    imageFit: 'contain',
    hasNibSelector: true,
    availableNibs: ['Fine', 'Medium'],
    galleryImages: [
      {
        src: '/assets/prera/empress_teal_1.jpg',
        caption: 'Pilot Prera in Empress Teal — Capped & Uncapped Profile',
      },
      {
        src: '/assets/prera/empress_teal_2.jpg',
        caption: 'Empress Teal — Translucent Resin Body & Silver Trim',
      },
      {
        src: '/assets/prera/empress_teal_3.jpg',
        caption: 'Empress Teal — Posted Cap Writing Balance (135mm)',
      },
      {
        src: '/assets/prera/empress_teal_4.jpg',
        caption: 'Empress Teal — Precision Silver Stainless Steel Nib Close-Up',
      },
      {
        src: '/assets/prera/empress_teal_5.jpg',
        caption: 'Empress Teal — Pre-Installed Pilot CON-40 Twist Converter View',
      },
      {
        src: '/assets/prera/empress_teal_6.jpg',
        caption: 'Empress Teal — Official Pilot Presentation Gift Box',
      },
      {
        src: '/assets/prera/cinnamon_brown.jpg',
        caption: 'Pilot Prera in Cinnamon Brown — Warm Café Series',
      },
      {
        src: '/assets/prera/porcelain_white.jpg',
        caption: 'Pilot Prera in Porcelain White — Café Series',
      },
    ],
    Origin: 'Made in Japan',
    availability: 'In Stock in Nairobi',
    shortSummary:
      'Translucent Empress Teal resin demonstrator with cushioned snap-cap, silver trim, Fine or Medium steel nib, and both a Pilot CON-40 converter and ink cartridge included.',
    description:
      'The Pilot Prera Fountain Pen in Empress Teal blends subtle sophistication with everyday functionality. Inspired by the cozy, welcoming atmosphere of a café where the aroma of fresh coffee and warm spices fills the air, the deep vibrant teal resin body offers a glimpse into the pen’s inner mechanics and included CON-40 converter. Famous among collectors for its velvety, cushioned snap-cap closure and agile 15g pocket-to-full-size posted balance, the Prera delivers a buttery-smooth writing experience in Fine (0.35mm) or Medium (0.50mm).',
    variantLabel: 'Select Prera Café Finish (Includes CON-40 Converter · KES 8,500)',
    variants: [
      {
        id: 'prera-empress-teal',
        label: 'Empress Teal · Café Edition',
        sublabel: 'Deep translucent teal resin barrel & cap · Silver trim · CON-40 converter included',
        swatchHex: '#125A66',
        strokeWidthPx: 1.8,
        image: '/assets/prera/empress_teal_1.jpg',
        nibEngraving: 'Super Quality Japan Steel Nib',
      },
      {
        id: 'prera-cinnamon-brown',
        label: 'Cinnamon Brown · Café Edition',
        sublabel: 'Warm spiced cinnamon translucent resin barrel · Silver trim · CON-40 included',
        swatchHex: '#6E3B2B',
        strokeWidthPx: 1.8,
        image: '/assets/prera/cinnamon_brown.jpg',
        nibEngraving: 'Super Quality Japan Steel Nib',
      },
      {
        id: 'prera-porcelain-white',
        label: 'Porcelain White · Café Edition',
        sublabel: 'Creamy café porcelain finish with translucent inner barrel · CON-40 included',
        swatchHex: '#E8E3D9',
        strokeWidthPx: 1.8,
        image: '/assets/prera/porcelain_white.jpg',
        nibEngraving: 'Super Quality Japan Steel Nib',
      },
    ],
    specs: [
      { label: 'Nib Options', value: 'Fine (0.35mm) & Medium (0.50mm) Silver Stainless Steel' },
      { label: 'Filling Mechanism', value: 'Pilot CON-40 Converter + Black Ink Cartridge (Both Included)' },
      { label: 'Body & Cap', value: 'Translucent Resin with Cushioned Snap-Cap & Silver Trim (15g)' },
      { label: 'Dimensions', value: '121mm Capped · 107mm Uncapped · 135mm Posted · 13.5mm Cap Ø' },
    ],
    includedItems: [
      'Pilot Prera Fountain Pen in Selected Finish (Fine or Medium Nib)',
      'Genuine Pilot CON-40 Twist Piston Converter (Included in Box)',
      '1× Pilot Black IC-50 Ink Cartridge',
      'Official Pilot Gift Presentation Case',
    ],
  },
  {
    id: 'pilot-iroshizuku-ink',
    name: 'PILOT IROSHIZUKU INK · 24 SHADES',
    japaneseTitle: '色彩雫 いろしずく · Complete 24-Color 50ml Glass Flacon Collection',
    category: 'Bottled Inks',
    priceKes: 7500,
    image: '/assets/iroshizuku/ama_iro.jpg',
    imageFit: 'contain',
    hasNibSelector: false,
    galleryImages: INK_STUDIO_SHADES.map((shade) => ({
      src: shade.image,
      caption: `${shade.name} (${shade.kanji}) — ${shade.meaning}`,
    })),
    Origin: 'Made in Japan',
    availability: 'All 24 Shades In Stock',
    shortSummary:
      'Explore the complete 24-color Japanese landscape ink library—each 50ml hand-blown glass bottle pictured with its authentic shade.',
    description:
      'Directly translated as "Color Droplets," Pilot Iroshizuku inks are formulated in Japan to offer extraordinary lubrication, nuanced shading, and effortless cleaning. Browse all 24 botanical and seasonal shades below—from Kon-peki (Deep Cerulean) and Tsuki-yo (Moonlight) to Yama-budo (Crimson Wild Grape) and Shin-ryoku (Deep Forest Green). Each heavy 50ml glass flacon features an internal dip reservoir to fill your fountain pen down to the very last drop.',
    variantLabel: 'Select Iroshizuku Shade (24 Colors · 50ml)',
    variants: INK_STUDIO_SHADES.map((shade) => ({
      id: shade.id,
      label: `${shade.name} (${shade.kanji}) · ${shade.meaning}`,
      sublabel: shade.sheenNote,
      swatchHex: shade.hex,
      image: shade.image,
      colorFamily: shade.colorFamily,
    })),
    specs: [
      { label: 'Complete Range', value: '24 Authentic Japanese Nature Shades Available' },
      { label: 'Volume', value: '50 ml (Approx. 65–80 Full Converter Fills)' },
      { label: 'Bottle Design', value: 'Heavy Faceted Glass with Internal Dip Well & Silk Cord' },
      { label: 'Formulation', value: 'Water-Based Dye with Flow-Lubricating Agents' },
    ],
    includedItems: [
      '50ml Pilot Iroshizuku Glass Flacon with Braided Silk Cord',
      'Silver & White Foil Presentation Box',
      'Cotton Paper Ink Swatch Reference Card',
    ],
  },
  {
    id: 'pilot-con-40',
    name: 'PILOT CON-40 TWIST CONVERTER',
    japaneseTitle: 'パイロット インキ吸入器 コンバーター CON-40 · Bottled Ink Piston Converter',
    category: 'Converters & Refills',
    priceKes: 1200,
    image: '/assets/converters/pilot_con40.jpg',
    imageFit: 'contain',
    hasNibSelector: false,
    galleryImages: [
      {
        src: '/assets/converters/pilot_con40.jpg',
        caption: 'Pilot CON-40 Twist Piston Converter with 4 Stainless Agitator Beads',
      },
      {
        src: '/assets/converters/pilot_con40_3.jpg',
        caption: 'Vertical View — Clear Ink Reservoir & Twist Knob',
      },
      {
        src: '/assets/converters/pilot_con40_2.jpg',
        caption: 'Angled View — Precision Japanese Piston Mechanism',
      },
    ],
    Origin: 'Made in Japan',
    availability: 'In Stock in Nairobi',
    shortSummary:
      'Genuine Pilot twist-piston bottled ink converter with 4 internal stainless steel agitator beads—compatible with Kakuno, Prera, Explorer, and Vanishing Point.',
    description:
      'Unlock the full 24-color library of Pilot Iroshizuku bottled inks for your Pilot Kakuno or Prera fountain pen. The official Japanese Pilot CON-40 features a crystal-clear resin reservoir so you can monitor your ink level at a glance, paired with four miniature stainless steel ball bearings inside the chamber that break up surface tension for uninterrupted, silky ink flow.',
    variantLabel: 'Select Converter View',
    variants: [
      {
        id: 'con-40-single',
        label: 'CON-40 Twist Converter (69810)',
        sublabel: 'Fits all Pilot Kakuno (Madoromi & Family), Prera, Explorer & Vanishing Point pens',
        swatchHex: '#CBD5E1',
        image: '/assets/converters/pilot_con40.jpg',
      },
      {
        id: 'con-40-vertical',
        label: 'CON-40 · Vertical Reservoir View',
        sublabel: 'Clear screw-type piston chamber with 4 stainless agitator beads (0.4ml capacity)',
        swatchHex: '#64748B',
        image: '/assets/converters/pilot_con40_3.jpg',
      },
    ],
    specs: [
      { label: 'Model / Part No.', value: 'Pilot CON-40 (Manufacturer #69810 · Replaces CON-50)' },
      { label: 'Mechanism', value: 'Twist-Action Screw Piston with 4 Steel Agitator Beads' },
      { label: 'Compatibility', value: 'Pilot Kakuno, Prera, Explorer, Falcon & Vanishing Point' },
      { label: 'Reservoir', value: '0.4 ml Transparent Resin Chamber' },
    ],
    includedItems: [
      'Genuine Pilot CON-40 Twist Piston Converter (Made in Japan)',
      '4 Internal Stainless Steel Surface-Tension Agitator Beads',
      'Bottled Ink Filling & Cleaning Guide',
    ],
  },
  {
    id: 'waterman-ink-bottle',
    name: 'WATERMAN PARIS 50ML BOTTLED INK',
    japaneseTitle: 'ウォーターマン ボトルインク · Encre de Paris 50ml Faceted Flacon',
    category: 'Bottled Inks',
    priceKes: 2000,
    image: '/assets/waterman/waterman_serenity_blue.jpg',
    imageFit: 'contain',
    hasNibSelector: false,
    galleryImages: [
      {
        src: '/assets/waterman/waterman_serenity_blue.jpg',
        caption: 'Serenity Blue (Encre Bleu Sérénité) · 50ml Faceted Bottle',
      },
      {
        src: '/assets/waterman/waterman_intense_black.jpg',
        caption: 'Intense Black (Encre Noir Intense) · 50ml Faceted Bottle',
      },
      {
        src: '/assets/waterman/waterman_audacious_red.jpg',
        caption: 'Audacious Red (Encre Rouge Audace) · 50ml Faceted Bottle',
      },
    ],
    Origin: 'Made in France',
    availability: 'In Stock in Nairobi',
    shortSummary:
      'Iconic multi-faceted 50ml glass ink bottle designed to tip on its side for effortless filling—available in Serenity Blue, Intense Black, and Audacious Red.',
    description:
      'Trusted by fountain pen enthusiasts and pen restorers worldwide, Waterman Paris 50ml bottled inks deliver reliable, ultra-safe flow in every fountain pen. The signature multi-faceted hexagonal glass bottle is engineered to rest securely on its side facets when ink levels run low, making it effortless to fill your Pilot CON-40 converter.',
    variantLabel: 'Select Waterman 50ml Shade',
    variants: [
      {
        id: 'waterman-serenity-blue',
        label: 'Serenity Blue · Encre Bleu Sérénité',
        sublabel: 'Classic royal sapphire blue with benchmark flow and easy-wash maintenance',
        swatchHex: '#15489C',
        image: '/assets/waterman/waterman_serenity_blue.jpg',
      },
      {
        id: 'waterman-intense-black',
        label: 'Intense Black · Encre Noir Intense',
        sublabel: 'Deep, authoritative charcoal-black for crisp everyday correspondence and signatures',
        swatchHex: '#1C1C1B',
        image: '/assets/waterman/waterman_intense_black.jpg',
      },
      {
        id: 'waterman-audacious-red',
        label: 'Audacious Red · Encre Rouge Audace',
        sublabel: 'Vibrant, expressive Parisian crimson-red for editing, annotations, and bold notes',
        swatchHex: '#C42828',
        image: '/assets/waterman/waterman_audacious_red.jpg',
      },
    ],
    specs: [
      { label: 'Available Shades', value: 'Serenity Blue, Intense Black & Audacious Red' },
      { label: 'Volume', value: '50 ml Multi-Faceted Glass Bottle' },
      { label: 'Bottle Feature', value: 'Angled Side Facets Allow Tilted Low-Ink Filling' },
      { label: 'Compatibility', value: 'Safe for All Pilot, Waterman & Vintage Fountain Pens' },
    ],
    includedItems: [
      'Waterman Paris 50ml Multi-Faceted Glass Ink Bottle',
      'Waterman Paris Presentation Box',
      'Side-Tilt Converter Filling Instructions',
    ],
  },
];
