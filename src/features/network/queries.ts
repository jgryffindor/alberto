import React from "react"
import { useQuery } from "react-query"
import { LedgerInfo, NetworkAttributes } from "@liftedinit/many-js"
import { useNetworkContext } from "./network-provider"

export function useLedgerInfo({ address }: { address: string }) {
  const { query: network } = useNetworkContext()
  return useQuery<LedgerInfo, Error>({
    queryKey: ["ledger.info", address, network?.url],
    queryFn: async () => await network?.ledger.info(),
    enabled: !!network?.url && !!address,
    initialData: { symbols: new Map() } as LedgerInfo,
  })
}

export function useNetworkStatus() {
  const { query: n } = useNetworkContext()
  const { data } = useQuery({
    queryKey: ["network", "attributes", n?.url],
    queryFn: async () => {
      const res = await n!.base.status()
      return res.status
    },
    enabled: Boolean(n),
  })

  return React.useMemo(() => {
    function getAttribute(attribute: NetworkAttributes) {
      return data?.attributes?.find((attr: NetworkAttributes) => {
        if (Array.isArray(attr)) {
          return attr[0] === attribute
        }
        return attr === attribute
      })
    }

    function getFeatures(attribute: number[] = [], targets: number[] = []) {
      const result: { [k: number]: boolean } = {}
      if (Array.isArray(attribute)) {
        const onlyFeatures = attribute.slice(1)
        targets.forEach(feat => {
          result[feat] = onlyFeatures.includes(feat)
        })
      }
      return result
    }
    return {
      status: data?.status,
      getAttribute,
      getFeatures,
    }
  }, [data])
}
