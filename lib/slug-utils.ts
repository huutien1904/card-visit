export function createSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace Vietnamese characters
      .replace(/[áàảạãăắằẳặẵâấầẩậẫ]/g, "a")
      .replace(/[éèẻẹẽêếềểệễ]/g, "e")
      .replace(/[íìỉịĩ]/g, "i")
      .replace(/[óòỏọõôốồổộỗơớờởợỡ]/g, "o")
      .replace(/[úùủụũưứừửựữ]/g, "u")
      .replace(/[ýỳỷỵỹ]/g, "y")
      .replace(/đ/g, "d")
      // Replace special characters and spaces with hyphens
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

export function isValidSlug(slug: string): boolean {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && slug.length >= 3 && slug.length <= 100;
}
