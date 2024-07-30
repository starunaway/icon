export default function getCookie(cookieName: string): string | null {
  // 将document.cookie字符串按照'; '分割成数组
  const cookies = document.cookie.split('; ');

  // 遍历cookies数组
  for (let i = 0; i < cookies.length; i++) {
    // 将每个cookie字符串按照'='分割成数组
    const cookiePair = cookies[i].split('=');

    // 如果cookie的名称与传入的cookieName相同，返回cookie的值
    if (cookiePair[0] === cookieName) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  // 如果没有找到对应的cookie，返回null
  return null;
}
