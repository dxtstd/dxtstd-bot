const IsEnableGreeting = function (args): boolean {
    const IsGroup = (args[0] == "group")
    const IsGreeting = (args[1] == "greeting")
    const IsEnable = (args[2] == "enable")
    
    return (IsGroup && IsGreeting && IsEnable)
}

const IsDisableGreeting = function (args): boolean {
    const IsGroup = (args[0] == "group")
    const IsGreeting = (args[1] == "greeting")
    const IsDisable = (args[2] == "disable")
    
    return (IsGroup && IsGreeting && IsDisable)
}