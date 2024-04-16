import { parse } from "../del"

type parseTestCase = {
    should: string
    input: string
    expected: { channel: string, ts: string } | null
}

describe("parse", () => {
    const cases: parseTestCase[] = [
        {
            should: "return channel and ts",
            input: "https://example.slack.com/archives/XXXXXXXXX/p1713249713168409",
            expected: { channel: "XXXXXXXXX", ts: "1713249713.168409" },
        },
        {
            should: "return null",
            input: "afasdfaefadf",
            expected: null,
        }
    ]

    cases.forEach((c) => {
        it(c.should, () => {
            expect(parse(c.input)).toEqual(c.expected)
        })
    })
})
