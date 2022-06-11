import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

import Types "./types";

shared(install) actor class Backend() = Self {
    
  /***********************
  *  STABLE VARIABLES *
  ***********************/

  stable var messages: Trie.Trie<Principal, Types.message> = Trie.empty();

  /*****************
  * PUBLIC METHODS *
  *****************/

  public shared ({caller}) func storeMessage(message: Types.message): async (){
    assert(caller != Principal.fromText("2vxsx-fae"));
    putMessage(caller, message);
  };

  public query func retrieveMessage(principal: Principal ): async ?Types.message{
    getMessage(principal);
  };

  /*******************
  * PRIVATE METHODS *
  *******************/
  func getMessage(principal : Principal) : ?Types.message = Trie.get(messages, Types.accountKey(principal), Principal.equal);

  func putMessage(principal : Principal, message: Types.message) {
    messages:= Trie.put(messages, Types.accountKey(principal), Principal.equal, message).0;
  };
}