import { HashChain } from "../models/HashChain";
import sha256 from 'crypto-js/sha256';

describe("test HashChain class", () => {
    const newHashChain = new HashChain();
    newHashChain.initHashChain(7);

    it("should have a hash chain of size 8 when specyfing 7.", () => {
        expect(newHashChain.hashes.length).toBe(8);
    });

    it("should return the last hash from the hash chain when asked for the Hash Root.", () => {
        expect(newHashChain.getHashRoot()).toBe(newHashChain.hashes[newHashChain.hashes.length - 1]);
    });

    const firstPaidHash = newHashChain.payHash()
    it("first hash payment must be different from hash root.", () => {
        expect(firstPaidHash).not.toBe(newHashChain.getHashRoot());
    });

    it("first hash payment hash must be equal to hash root.", () => {
        expect(sha256(firstPaidHash).toString()).toBe(newHashChain.getHashRoot());
    });

    it("Should make right payments", () => {
        var lastHash = firstPaidHash
        for (let index = 0; index < 6; index++) {
            var hashLink = newHashChain.payHash();
            expect(sha256(hashLink).toString()).toBe(lastHash)
            lastHash = hashLink;   
        }

    })
});

