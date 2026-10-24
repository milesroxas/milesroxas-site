const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: /** @type {'header'} */ ('header'),
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // The home page was the Pages document `home` before it became the Home global.
  const homeRedirect = { source: '/home', destination: '/', permanent: true }

  const redirects = [internetExplorerRedirect, homeRedirect]

  return redirects
}

export default redirects
