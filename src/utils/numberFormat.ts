const intl = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
})


export function numberFormat(number: number): string {
    return intl.format(number);
}