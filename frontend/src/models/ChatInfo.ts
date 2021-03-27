import PrivateKey from "./PrivateKey";
import PublicKey from "./PublicKey";

export default class ChatInfo {
    myPrivateKeys: PrivateKey[] = [];
    receiverPublicKey: PublicKey|null = null;
    receiverIteration: number = 1;
    prevHash: string = '678e9551d2f157d792e1360b0e950671726fd27a18e272305db26b33faaebdc1';
}