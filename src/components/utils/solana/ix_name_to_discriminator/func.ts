import { sha256, toUtf8Bytes } from "ethers";

export const ixNameToDiscriminator = (ixName: string): number[] => {
  const hash = sha256(toUtf8Bytes(`global:${ixName}`)).slice(2, 18);
  const discriminator = Array.from(Buffer.from(hash, "hex"));
  return discriminator;
};
