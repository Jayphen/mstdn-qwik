import { compactDecrypt, CompactEncrypt } from "jose";

export async function encryptToken(token: string) {
  const encoder = new TextEncoder();

  const jwe = await new CompactEncrypt(encoder.encode(token))
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .encrypt(encoder.encode(process.env.SECRET));

  return jwe;
}

export async function decryptToken(jwe: string) {
  const { plaintext } = await compactDecrypt(
    jwe,
    new TextEncoder().encode(process.env.SECRET)
  );

  const decoded = new TextDecoder().decode(plaintext);

  return decoded;
}
