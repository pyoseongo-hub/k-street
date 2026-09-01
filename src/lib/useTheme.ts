import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('k-street-theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', t);
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('k-street-theme', t);
    applyTheme(t);
  };

  /**
   * 지금 실제로 보이고 있는 색. theme이 'system'이면 폰 설정을 따라간다.
   *
   * 서버에서 미리 그릴 때는 matchMedia가 없으므로 어두운 쪽으로 둔다 — 이 앱의
   * 기본은 다크다(tokens.css).
   */
  const effective = (): 'dark' | 'light' => {
    if (theme !== 'system') return theme;
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  /**
   * 🌗 어둡게 ↔ 밝게, **두 가지만** 오간다.
   *
   * 2026-09-01 사용자 지적("다크 라이트 모드 말고 이상한 게 있어") — 원래는
   * dark → light → **system(🔄)** 세 가지를 돌았다. 세 번째가 문제였다:
   *   · 🔄 아이콘만 봐서는 무슨 뜻인지 알 수 없다.
   *   · 폰 설정이 이미 다크면 **눌러도 화면이 그대로**라 고장 난 것처럼 보인다.
   * 처음 열었을 때 폰 설정을 따라가는 것은 그대로 두고(theme의 초기값이 system),
   * **한 번이라도 누르면 그때부터는 사용자가 고른 값**으로 굳는다. 흔한 방식이고
   * 누를 때마다 화면이 반드시 바뀐다.
   */
  const toggleTheme = () => setTheme(effective() === 'dark' ? 'light' : 'dark');

  /** 지금 상태를 보여준다 — 🌙이면 지금 어두운 화면이라는 뜻. */
  const getIcon = () => (effective() === 'dark' ? '🌙' : '☀️');

  return { theme, setTheme, toggleTheme, getIcon, isClient };
}
