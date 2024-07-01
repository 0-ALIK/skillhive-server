import Paypal from '@paypal/checkout-server-sdk';
import Payouts from '@paypal/payouts-sdk';

export interface Item {
    price: number;
    description: string;
}

export interface Vendedor {
    correo: string;
    monto: number;
}

export class PayPalService {

    private static client = new Paypal.core.PayPalHttpClient( new Paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID || '',
        process.env.PAYPAL_CLIENT_SECRET || ''
    ));

    private static payoutsClient = new Payouts.core.PayPalHttpClient( new Payouts.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID || '',
        process.env.PAYPAL_CLIENT_SECRET || ''
    ));

    public static async crearOrden(items: Item[]) {
        const request = new Paypal.orders.OrdersCreateRequest();

        const purchase_units = items.map(item => ({
            amount: {
                currency_code: 'USD',
                value: item.price.toString(),
            },
            description: item.description,
        }));

        request.requestBody({
            intent: 'CAPTURE',
            purchase_units,
        });

        try {
            const response = await this.client.execute(request);

            return response.result.id;
        } catch (error) {
            console.error(error);
            throw new Error('Error al crear la orden de pago');
        }
    }

    public static async aprobarOrden(ordenId: string) {
        const request = new Paypal.orders.OrdersCaptureRequest(ordenId);

        try {
            const response = await this.client.execute(request);

            return response;
        } catch (error) {
            console.error(error);
            throw new Error('Error al aprobar la orden de pago');
        }
    }

    // TODO: no esta terminado
    public static async distribuirPago(vendedores: Vendedor[]) {
        const request = new Payouts.payouts.PayoutsPostRequest();

        vendedores = vendedores.map(vendedor => {
            const comisionVendedor = vendedor.monto * Number(process.env.COMISSION || '0.07');
            return {
                correo: vendedor.correo,
                monto: Number((vendedor.monto - comisionVendedor).toFixed(2)),
            }
        });

        const items: any[] = vendedores.map(vendedor => ({
            recipient_type: 'EMAIL',
            amount: {
                currency: 'USD',
                value: vendedor.monto.toString(),
            },
            receiver: vendedor.correo,
            note: 'Pago de venta',
        }));

        request.requestBody({
            sender_batch_header: {
                recipient_type: 'EMAIL',
                email_message: 'Pago de venta',
                note: 'Pago de venta',
                sender_batch_id: 'batch_' + Math.random().toString(36).substring(9),
                email_subject: 'Pago de venta',
            },
            items
        });

        try {
            const response = await this.payoutsClient.execute(request);

            return response;
        } catch (error) {
            console.error(error);
            throw new Error('Error al distribuir el pago');
        }
    }

}
