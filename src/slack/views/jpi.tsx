import { Blocks, Image } from 'jsx-slack'

export const jpiBlocks = ({ text, url }: { text: string; url: string }) => (
  <Blocks>
    <Image src={url} alt={text} title={text} />
  </Blocks>
)
