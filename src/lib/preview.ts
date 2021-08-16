export type PreviewData = {
  apiName?: string;
  slug?: string;
  draftKey?: string;
};

export function applyPreviewDataToIdQuery<T>(
  preview: boolean,
  // previewData: { [key: string]: string },
  previewData: PreviewData | undefined,
  apiName: string,
  id: string,
  query: T
): [string, T] {
  if (
    preview &&
    previewData &&
    previewData.slug &&
    previewData.draftKey &&
    previewData.apiName === apiName
  ) {
    return [previewData.slug, { ...query, draftKey: previewData.draftKey }];
  }
  return [id, { ...query }];
}
