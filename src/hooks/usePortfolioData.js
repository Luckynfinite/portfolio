import { useQuery } from "@tanstack/react-query";
import { fetchPublicPortfolioData } from "../services/portfolioApi";

export function usePortfolioData() {
  return useQuery({
    queryKey: ["portfolio", "public"],
    queryFn: fetchPublicPortfolioData,
  });
}
