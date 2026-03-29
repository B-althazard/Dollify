interface RuleNoticeProps {
  tone?: 'neutral' | 'danger' | 'success';
  children: string;
}

export function RuleNotice({ tone = 'neutral', children }: RuleNoticeProps) {
  return <p className={`rule-notice is-${tone}`}>{children}</p>;
}
