interface environmentConfig {
    use:'assets'|'local'|'server',
    api:string,
    debug:boolean,
}

export const environment:environmentConfig = {
    use : 'server', // assets, local or server
    api: 'http://localhost:3000/api',
    debug:true
}