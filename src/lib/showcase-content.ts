export type MediaItem = {
    type: "image" | "video";
    src: string;
};

export type ShowcaseCategory = {
    id: string;
    label: string;
    // Thumbnail shown on the card itself
    cover: MediaItem;
    // 2-4 items shown when the card is opened
    media: MediaItem[];
};

// Put your actual files in /public/media/... with these exact names,
// or change the paths below to match whatever you upload.
export const HERO_SLIDES: MediaItem[] = [
    { type: "image", src: "/media/hero/1.jpg" },
    { type: "video", src: "/media/hero/2.mp4" },
    { type: "image", src: "/media/hero/3.jpg" },
    { type: "image", src: "/media/hero/4.jpg" },
    { type: "video", src: "/media/hero/5.mp4" },
];

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
    {
        id: "wedding",
        label: "Wedding",
        cover: { type: "image", src: "/media/wedding/cover.jpg" },
        media: [
            { type: "image", src: "/media/wedding/1.jpg" },
            { type: "image", src: "/media/wedding/2.jpg" },
            { type: "video", src: "/media/wedding/3.mp4" },
            { type: "image", src: "/media/wedding/4.jpg" },
        ],
    },
    {
        id: "events",
        label: "Events",
        cover: { type: "image", src: "/media/events/cover.jpg" },
        media: [
            { type: "image", src: "/media/events/1.jpg" },
            { type: "video", src: "/media/events/2.mp4" },
            { type: "image", src: "/media/events/3.jpg" },
        ],
    },
    {
        id: "conference",
        label: "Conference / Corporate",
        cover: { type: "image", src: "/media/conference/cover.jpg" },
        media: [
            { type: "image", src: "/media/conference/1.jpg" },
            { type: "image", src: "/media/conference/2.jpg" },
            { type: "video", src: "/media/conference/3.mp4" },
        ],
    },
    {
        id: "school",
        label: "School Events",
        cover: { type: "image", src: "/media/school/cover.jpg" },
        media: [
            { type: "image", src: "/media/school/1.jpg" },
            { type: "image", src: "/media/school/2.jpg" },
            { type: "image", src: "/media/school/3.jpg" },
        ],
    },
    {
        id: "college",
        label: "College Events",
        cover: { type: "image", src: "/media/college/cover.jpg" },
        media: [
            { type: "image", src: "/media/college/1.jpg" },
            { type: "video", src: "/media/college/2.mp4" },
            { type: "image", src: "/media/college/3.jpg" },
        ],
    },
    {
        id: "havan",
        label: "Havan",
        cover: { type: "image", src: "/media/havan/cover.jpg" },
        media: [
            { type: "image", src: "/media/havan/1.jpg" },
            { type: "image", src: "/media/havan/2.jpg" },
            { type: "image", src: "/media/havan/3.jpg" },
        ],
    },
    {
        id: "choki",
        label: "Choki",
        cover: { type: "image", src: "/media/choki/cover.jpg" },
        media: [
            { type: "image", src: "/media/choki/1.jpg" },

        ],
    },
    {
        id: "jagran",
        label: "Jagran",
        cover: { type: "image", src: "/media/jagran/cover.jpg" },
        media: [
            { type: "image", src: "/media/jagran/1.jpg" },
            { type: "video", src: "/media/jagran/2.mp4" },
            { type: "image", src: "/media/jagran/3.jpg" },
        ],
    },
];