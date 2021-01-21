const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function GenerateRandomString(length) {
    
    let result = "";
    
    for (let i = 0; i < length; i++)
    {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

export function CheckCredsValid(username, password)
{
    return (username && password && RegExp("^(\\w|\\d){3,32}$").test(username) && password.length >= 6);
}