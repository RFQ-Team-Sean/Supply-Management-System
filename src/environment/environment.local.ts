interface environmentConfig {
    use:'assets'|'local'|'server',
    api:string,
    debug:boolean,
}

export const environment:environmentConfig = {
    use : 'local', // assets, local or server
    api: 'https://quanby-staging.com/api',
    debug:true
}