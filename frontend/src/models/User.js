export default class User
{
    constructor()
    {
        this.Username = '';
        this.UserID = '';
    }
    
    static Init(dbUser)
    {
        let newUser = new User();
        
        newUser.UserID = dbUser.UserID;
        newUser.Username = dbUser.Username;
        
        return newUser;
    }
}