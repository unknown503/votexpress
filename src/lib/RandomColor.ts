export default function RandomColor() {
    const o = Math.round, r = Math.random, s = 255;
    const red = o(r() * s)
    const green = o(r() * s)
    const blue = o(r() * s)

    const rbga = (lowOpacity: boolean) => `rgba(${red},${green},${blue},${lowOpacity ? 0.2 : 1})`
    return { bg: rbga(true), border: rbga(false) }
}