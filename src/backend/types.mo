import Principal "mo:base/Principal";
import Trie "mo:base/Trie";

module {
    public func accountKey(t: Principal) : Trie.Key<Principal> = { key = t; hash = Principal.hash t };
    public type message = {
      discordId: Text;
      guildId: Text;
    };
}
