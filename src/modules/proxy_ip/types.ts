export interface CheckerProxy {
  id: number;
  local_id: number;
  report_id: string;
  addr: string;
  type: number; // 1:http 2:https 4:socks5
  kind: number;
  timeout: number;
  cookie: boolean;
  referer: boolean;
  post: boolean;
  ip: string;
  addr_geo_iso: string;
  addr_geo_country: string;
  addr_geo_city: string;
  ip_geo_iso: string;
  ip_geo_country: string;
  ip_geo_city: string;
  created_at: string;
  updated_at: string;
  skip: boolean;
  from_cache: boolean;
}
