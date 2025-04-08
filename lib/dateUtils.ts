import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국어 로케일 추가

// 기본 설정: 한국어 로케일 사용
dayjs.locale("ko");

/**
 * ISO 형식의 날짜 문자열을 읽기 쉬운 형식으로 변환
 * @param dateString ISO 형식의 날짜 문자열 (예: 2025-03-24T23:21:02.000Z)
 * @param format 사용할 날짜 포맷 (기본값: YYYY-MM-DD HH:mm)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  dateString?: string,
  format = "YYYY-MM-DD HH:mm"
): string {
  if (!dateString) return "-";
  return dayjs(dateString).format(format);
}

/**
 * ISO 형식의 날짜 문자열을 날짜만 표시하는 형식으로 변환
 * @param dateString ISO 형식의 날짜 문자열
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDateOnly(dateString?: string): string {
  return formatDate(dateString, "YYYY-MM-DD");
}

/**
 * ISO 형식의 날짜 문자열을 시간만 표시하는 형식으로 변환
 * @param dateString ISO 형식의 날짜 문자열
 * @returns HH:mm:ss 형식의 시간 문자열
 */
export function formatTimeOnly(dateString?: string): string {
  return formatDate(dateString, "HH:mm:ss");
}

/**
 * ISO 형식의 날짜 문자열을 상대적 시간으로 변환 (예: 3일 전, 2시간 전)
 * @param dateString ISO 형식의 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "-";

  const date = dayjs(dateString);
  const now = dayjs();
  const diffMinutes = now.diff(date, "minute");

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = now.diff(date, "hour");
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = now.diff(date, "day");
  if (diffDays < 30) return `${diffDays}일 전`;

  const diffMonths = now.diff(date, "month");
  if (diffMonths < 12) return `${diffMonths}개월 전`;

  return `${now.diff(date, "year")}년 전`;
}
