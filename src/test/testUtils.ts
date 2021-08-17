export function queryParams(src?: string): { [key: string]: string } {
  const q = new URLSearchParams(src ? src.split('?', 2)[1] : '');
  const ret: { [key: string]: string } = {};
  q.forEach((v, k) => {
    ret[k] = v;
  });
  return ret;
}
