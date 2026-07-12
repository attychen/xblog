import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let redis: Redis | null = null;
try {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
  }
} catch {}

export async function POST() {
  if (!redis) return NextResponse.json({ pv: 0, error: "Redis not configured" });
  try {
    const pv = await redis.incr("fazhouji:pv");
    return NextResponse.json({ pv });
  } catch (e) {
    return NextResponse.json({ pv: 0, error: String(e) });
  }
}

export async function GET() {
  if (!redis) return NextResponse.json({ pv: 0 });
  try {
    const pv = await redis.get<number>("fazhouji:pv");
    return NextResponse.json({ pv: pv ?? 0 });
  } catch {
    return NextResponse.json({ pv: 0 });
  }
}