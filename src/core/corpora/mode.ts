const params = new URLSearchParams(location.search)
const currentMode = params.get('mode') || 'default'
export default currentMode
