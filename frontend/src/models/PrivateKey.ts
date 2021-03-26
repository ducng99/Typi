class PrivateKey
{
    ID: number;
    Key: string;
    
    constructor(id: number, key: string)
    {
        this.ID = id;
        this.Key = key;
    }
    
    toJSON() : {ID : number, PrivateKey: string}
    {
        return { ID: this.ID, PrivateKey: this.Key };
    }
}

export default PrivateKey;