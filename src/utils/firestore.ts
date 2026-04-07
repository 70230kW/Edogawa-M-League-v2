/**
 * Firestore にundefinedを送信するとエラーになるため、
 * 全てのaddDoc/setDoc呼び出し前にこの関数を適用する。
 */
export function removeUndefined<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      value === undefined ? null : value
    )
  );
}
