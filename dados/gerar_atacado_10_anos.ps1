Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$startDate = Get-Date '2015-01-01'
$endDate = Get-Date '2024-12-31'

$stores = @(
    @{ Nome = 'Filial Norte'; Fator = 1.12 },
    @{ Nome = 'Filial Sul'; Fator = 0.94 },
    @{ Nome = 'Filial Centro'; Fator = 1.00 },
    @{ Nome = 'Filial Leste'; Fator = 0.97 },
    @{ Nome = 'Filial Oeste'; Fator = 1.05 }
)

$categories = @(
    @{ Nome = 'Alimentos'; BaseQtd = 95; Preco = 18.5; CustoPerc = 0.77; SkuPrefix = 'ALI' },
    @{ Nome = 'Bebidas'; BaseQtd = 88; Preco = 14.9; CustoPerc = 0.74; SkuPrefix = 'BEB' },
    @{ Nome = 'Limpeza'; BaseQtd = 72; Preco = 22.3; CustoPerc = 0.69; SkuPrefix = 'LIM' },
    @{ Nome = 'Higiene'; BaseQtd = 66; Preco = 24.8; CustoPerc = 0.68; SkuPrefix = 'HIG' },
    @{ Nome = 'Frios'; BaseQtd = 58; Preco = 31.5; CustoPerc = 0.81; SkuPrefix = 'FRI' },
    @{ Nome = 'Embalagens'; BaseQtd = 50; Preco = 27.2; CustoPerc = 0.65; SkuPrefix = 'EMB' },
    @{ Nome = 'Papelaria'; BaseQtd = 43; Preco = 16.7; CustoPerc = 0.63; SkuPrefix = 'PAP' },
    @{ Nome = 'Descartaveis'; BaseQtd = 61; Preco = 19.4; CustoPerc = 0.66; SkuPrefix = 'DES' }
)

$channels = @(
    @{ Nome = 'Balcao'; Fator = 0.96 },
    @{ Nome = 'Televendas'; Fator = 1.03 },
    @{ Nome = 'E-commerce'; Fator = 1.08 }
)

$monthFactor = @{
    1 = 1.07; 2 = 0.96; 3 = 0.99; 4 = 1.02; 5 = 1.03; 6 = 1.06;
    7 = 1.01; 8 = 1.00; 9 = 0.98; 10 = 1.05; 11 = 1.14; 12 = 1.26
}

$weekdayFactor = @{
    'Monday' = 1.09
    'Tuesday' = 1.05
    'Wednesday' = 1.04
    'Thursday' = 1.02
    'Friday' = 1.07
    'Saturday' = 0.86
    'Sunday' = 0.73
}

$rng = [System.Random]::new(42)

function Get-NormalNoise {
    param(
        [double]$Mean = 0.0,
        [double]$StdDev = 1.0
    )

    $u1 = 1.0 - $rng.NextDouble()
    $u2 = 1.0 - $rng.NextDouble()
    $randStdNormal = [Math]::Sqrt(-2.0 * [Math]::Log($u1)) * [Math]::Cos(2.0 * [Math]::PI * $u2)
    return $Mean + $StdDev * $randStdNormal
}

function Pick-Channel {
    $p = $rng.NextDouble()
    if ($p -lt 0.56) { return $channels[0] }
    if ($p -lt 0.86) { return $channels[1] }
    return $channels[2]
}

function Is-HolidayLike {
    param([datetime]$Date)

    if ($Date.Month -eq 12 -and $Date.Day -ge 15) { return $true }
    if ($Date.Month -eq 11 -and $Date.Day -ge 20) { return $true }
    if ($Date.Month -eq 3 -and $Date.Day -ge 20 -and $Date.Day -le 31) { return $true }
    if ($Date.Month -eq 4 -and $Date.Day -le 10) { return $true }
    return $false
}

$outputFile = Join-Path $PSScriptRoot 'atacado_10_anos_realista.csv'
$monthlyFile = Join-Path $PSScriptRoot 'atacado_10_anos_mensal_120_meses.csv'
$manifestFile = Join-Path $PSScriptRoot 'atacado_10_anos_manifesto.json'

$rows = New-Object System.Collections.Generic.List[object]
$monthAgg = @{}
$current = $startDate
$pedidoSeq = 100000

while ($current -le $endDate) {
    $month = $current.Month
    $year = $current.Year
    $dow = $current.DayOfWeek.ToString()

    $yearsFromStart = $year - 2015
    $growth = [Math]::Pow(1.036, $yearsFromStart)
    $inflation = [Math]::Pow(1.042, $yearsFromStart)

    $isHoliday = Is-HolidayLike -Date $current
    $holidayFactor = if ($isHoliday) { 1.12 } else { 1.0 }

    $isPaydayWindow = ($current.Day -ge 4 -and $current.Day -le 10) -or ($current.Day -ge 20 -and $current.Day -le 26)
    $paydayFactor = if ($isPaydayWindow) { 1.07 } else { 1.0 }

    foreach ($store in $stores) {
        foreach ($category in $categories) {
            $channel = Pick-Channel

            $promoChance = if ($month -in @(11,12,1)) { 0.23 } elseif ($isPaydayWindow) { 0.16 } else { 0.09 }
            $promo = if ($rng.NextDouble() -lt $promoChance) { 1 } else { 0 }
            $promoFactor = if ($promo -eq 1) { 1.19 } else { 1.0 }

            $stockout = if ($rng.NextDouble() -lt 0.035) { 1 } else { 0 }
            $stockoutFactor = if ($stockout -eq 1) { 0.64 } else { 1.0 }

            $weatherShock = 1.0 + (Get-NormalNoise -Mean 0.0 -StdDev 0.025)
            $noise = 1.0 + (Get-NormalNoise -Mean 0.0 -StdDev 0.11)

            $baseQty = [double]$category.BaseQtd
            $qty = $baseQty * $store.Fator * $channel.Fator * $monthFactor[$month] * $weekdayFactor[$dow] * $growth * $holidayFactor * $paydayFactor * $promoFactor * $stockoutFactor * $weatherShock * $noise
            $qty = [Math]::Max(5, [Math]::Round($qty, 0))

            $unitPriceBase = [double]$category.Preco * $inflation
            $discountFactor = if ($promo -eq 1) { 0.94 } else { 1.0 }
            $unitPrice = $unitPriceBase * $discountFactor * (1.0 + (Get-NormalNoise -Mean 0.0 -StdDev 0.015))
            $unitPrice = [Math]::Max(2.5, [Math]::Round($unitPrice, 2))

            $grossRevenue = [Math]::Round($qty * $unitPrice, 2)

            $costFactor = [double]$category.CustoPerc + (Get-NormalNoise -Mean 0.0 -StdDev 0.012)
            $costFactor = [Math]::Max(0.52, [Math]::Min(0.90, $costFactor))
            $cost = [Math]::Round($grossRevenue * $costFactor, 2)

            $marginPct = if ($grossRevenue -gt 0) { [Math]::Round((($grossRevenue - $cost) / $grossRevenue) * 100, 2) } else { 0 }

            $prazoPagamento = if ($channel.Nome -eq 'E-commerce') {
                7
            } elseif ($promo -eq 1) {
                35
            } else {
                @(14, 21, 28, 35)[$rng.Next(0, 4)]
            }

            $pedidoSeq += 1
            $skuNumber = $rng.Next(100, 999)
            $sku = "{0}-{1}" -f $category.SkuPrefix, $skuNumber
            $clienteId = "CL{0}" -f $rng.Next(10000, 99999)

            $rows.Add([PSCustomObject]@{
                data = $current.ToString('yyyy-MM-dd')
                ano = $year
                mes = $month
                dia_semana = $dow
                loja = $store.Nome
                categoria = $category.Nome
                sku = $sku
                canal = $channel.Nome
                promocao = $promo
                ruptura = $stockout
                feriado_sazonal = if ($isHoliday) { 1 } else { 0 }
                preco_unitario = $unitPrice
                quantidade = [int]$qty
                vendas = $grossRevenue
                custo = $cost
                margem_bruta_perc = $marginPct
                prazo_pagamento_dias = $prazoPagamento
                pedido_id = "PD{0}" -f $pedidoSeq
                cliente_id = $clienteId
            })

            $monthKey = $current.ToString('yyyy-MM')
            if (-not $monthAgg.ContainsKey($monthKey)) {
                $monthAgg[$monthKey] = [ordered]@{
                    vendas = 0.0
                    custo = 0.0
                    quantidade = 0
                    pedidos = 0
                }
            }

            $monthAgg[$monthKey].vendas += $grossRevenue
            $monthAgg[$monthKey].custo += $cost
            $monthAgg[$monthKey].quantidade += [int]$qty
            $monthAgg[$monthKey].pedidos += 1
        }
    }

    $current = $current.AddDays(1)
}

$rows | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8

$monthlyRows = $monthAgg.Keys |
    Sort-Object |
    ForEach-Object {
        $k = $_
        $v = $monthAgg[$k]
        $marginPct = if ($v.vendas -gt 0) { (($v.vendas - $v.custo) / $v.vendas) * 100 } else { 0 }
        [PSCustomObject]@{
            mes = $k
            vendas = [Math]::Round($v.vendas, 2)
            custo = [Math]::Round($v.custo, 2)
            quantidade = [int]$v.quantidade
            pedidos = [int]$v.pedidos
            margem_bruta_perc = [Math]::Round($marginPct, 2)
        }
    }

$monthlyRows | Export-Csv -Path $monthlyFile -NoTypeInformation -Encoding UTF8

$firstDate = $rows[0].data
$lastDate = $rows[$rows.Count - 1].data
$manifest = [ordered]@{
    dataset = 'atacado_10_anos_realista'
    periodo_inicio = $firstDate
    periodo_fim = $lastDate
    anos_cobertos = 10
    meses_mensal = $monthlyRows.Count
    linhas_transacionais = $rows.Count
    lojas = ($stores | ForEach-Object { $_.Nome })
    categorias = ($categories | ForEach-Object { $_.Nome })
    canais = ($channels | ForEach-Object { $_.Nome })
    seed = 42
}

$manifest | ConvertTo-Json -Depth 5 | Out-File -FilePath $manifestFile -Encoding utf8

Write-Host "Arquivo gerado: $outputFile"
Write-Host "Linhas: $($rows.Count)"
Write-Host "Arquivo mensal (120 meses): $monthlyFile"
Write-Host "Manifesto: $manifestFile"
