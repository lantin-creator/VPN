import { http, HttpResponse }  from 'msw';

export const payment = [
    http.post('/api/payment', async ({request}) => {
        const body = (await request.json()) as { card?: string; cvv?: string }
        if(!body.card || !body.cvv || body.card.length < 16 || body.cvv.length < 3)
        {
           return HttpResponse.json(
                { success: false, message: "Оплата не прошла"},
                { status: 400}
            )
        }

        return HttpResponse.json({success: true, message: "Оплата прошла"})
    })
]