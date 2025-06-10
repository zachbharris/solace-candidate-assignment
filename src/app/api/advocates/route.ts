import { asc, count, ilike, or, sql } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query") || "";

  // build our search condition
  const searchCondition = query
    ? or(
        ilike(advocates.firstName, `%${query}%`),
        ilike(advocates.lastName, `%${query}%`),
        ilike(advocates.city, `%${query}%`),
        ilike(advocates.degree, `%${query}%`),

        // Search in JSONB array - converts JSONB to text and searches
        sql`${advocates.specialties}::text ILIKE ${`%${query}%`}`,
      )
    : undefined;

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 4;
  const offset = (page - 1) * limit;

  // get the total count of records
  const [totalCountResult] = await db
    .select({ count: count() })
    .from(advocates)
    .where(searchCondition);

  const totalCount = totalCountResult.count;

  // Uncomment this line to use a database
  const data = await db
    .select()
    .from(advocates)
    .where(searchCondition)
    .orderBy(asc(advocates.lastName))
    .limit(limit)
    .offset(offset);

  // Calculate pagination metadata
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);
  const pageSize = limit;

  return Response.json({
    data,
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalCount,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  });
}
