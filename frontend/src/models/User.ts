export default class User
{
    Username = '';
    UserID = 0;
    
    constructor()
    {
        this.Username = '';
        this.UserID = 0;
    }
    
    static Init(dbUser: {UserID: number, Username: string}): User
    {
        const newUser = new User();
        
        newUser.UserID = dbUser.UserID;
        newUser.Username = dbUser.Username;
        
        return newUser;
    }
}