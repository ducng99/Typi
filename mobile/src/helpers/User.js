export default class User {
    constructor(user)
    {
        this.UserID = user?.UserID ?? '';
        this.Username = user?.Username ?? '';
    };
    
    GetUsername()
    {
        return this.Username;
    }
};