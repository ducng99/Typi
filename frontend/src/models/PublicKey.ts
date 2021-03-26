class PublicKey
{
    ID: number;
    Key: string;
    
    constructor(id: number, key: string)
    {
        this.ID = id;
        this.Key = key;
    }
    
    toJSON() : {ID : number, PublicKey: string}
    {
        return { ID: this.ID, PublicKey: this.Key };
    }
}

export default PublicKey;