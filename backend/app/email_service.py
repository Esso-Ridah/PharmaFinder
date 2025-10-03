import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Configuration email (à configurer selon votre fournisseur)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.email_user = os.getenv("EMAIL_USER", "noreply@pharmafinder.com")
        self.email_password = os.getenv("EMAIL_PASSWORD", "")

        # Informations de la plateforme
        self.platform_name = "PharmaFinder"
        self.platform_email = "contact@pharmafinder.com"
        self.platform_phone = "+225 07 XX XX XX XX"
        self.platform_address = "Abidjan, Côte d'Ivoire"
        self.platform_website = "https://pharmafinder.com"

    def _create_email_header(self) -> str:
        """Crée l'en-tête HTML avec logo et informations de la plateforme"""
        return f"""
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
                    💊 {self.platform_name}
                </h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
                    Votre pharmacie en ligne de confiance
                </p>
            </header>
        """

    def _create_email_footer(self) -> str:
        """Crée le pied de page HTML avec coordonnées"""
        return f"""
            <footer style="background-color: #f8f9fa; padding: 20px; margin-top: 30px; border-top: 1px solid #e9ecef;">
                <div style="text-align: center; color: #6c757d; font-size: 14px;">
                    <h3 style="color: #495057; margin-bottom: 15px;">{self.platform_name}</h3>
                    <p style="margin: 5px 0;">
                        📧 Email: <a href="mailto:{self.platform_email}" style="color: #667eea;">{self.platform_email}</a>
                    </p>
                    <p style="margin: 5px 0;">
                        📞 Téléphone: {self.platform_phone}
                    </p>
                    <p style="margin: 5px 0;">
                        📍 Adresse: {self.platform_address}
                    </p>
                    <p style="margin: 15px 0 5px 0;">
                        🌐 <a href="{self.platform_website}" style="color: #667eea;">{self.platform_website}</a>
                    </p>
                    <hr style="border: none; height: 1px; background-color: #e9ecef; margin: 20px 0;">
                    <p style="font-size: 12px; color: #868e96;">
                        © {datetime.now().year} {self.platform_name}. Tous droits réservés.<br>
                        Cet email a été envoyé automatiquement, veuillez ne pas y répondre.
                    </p>
                </div>
            </footer>
        </div>
        """

    def send_order_confirmation_email(self, user_email: str, user_name: str, orders: List[dict]):
        """Envoie un email de confirmation de commande"""
        try:
            subject = f"✅ Confirmation de votre commande - {self.platform_name}"

            # Calcul du total
            total_amount = sum(order.get('total_amount', 0) for order in orders)
            total_items = sum(order.get('items_count', 0) for order in orders)

            # Construction du contenu HTML
            html_content = self._create_email_header()

            html_content += f"""
            <div style="padding: 20px;">
                <h2 style="color: #28a745; margin-bottom: 20px;">
                    🎉 Merci pour votre commande, {user_name} !
                </h2>

                <p style="font-size: 16px; color: #495057; line-height: 1.6;">
                    Votre commande a été reçue avec succès. Nous préparons vos médicaments
                    et vous tiendrons informé de l'avancement.
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #495057; margin-top: 0;">📋 Récapitulatif de la commande</h3>
                    <p><strong>Nombre de commandes:</strong> {len(orders)}</p>
                    <p><strong>Nombre total d'articles:</strong> {total_items}</p>
                    <p><strong>Montant total:</strong> {total_amount:,.0f} FCFA</p>
                    <p><strong>Date:</strong> {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
                </div>

                <h3 style="color: #495057;">🏥 Détails par pharmacie</h3>
            """

            # Détails de chaque commande
            for i, order in enumerate(orders, 1):
                html_content += f"""
                <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <h4 style="color: #667eea; margin-top: 0;">
                        Commande #{order.get('order_number', f'CMD{i:03d}')}
                    </h4>
                    <p><strong>Pharmacie:</strong> {order.get('pharmacy_name', 'Pharmacie inconnue')}</p>
                    <p><strong>Type:</strong> {order.get('delivery_type', '').replace('pickup', '🏪 Retrait en pharmacie').replace('home_delivery', '🚚 Livraison à domicile')}</p>
                    <p><strong>Articles:</strong> {order.get('items_count', 0)}</p>
                    <p><strong>Total:</strong> {order.get('total_amount', 0):,.0f} FCFA</p>
                    {f'<p><strong>Code de retrait:</strong> <span style="font-family: monospace; background-color: #fff3cd; padding: 2px 6px; border-radius: 4px;">{order.get("pickup_code")}</span></p>' if order.get('pickup_code') else ''}
                </div>
                """

            html_content += f"""
                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                    <h4 style="color: #0c5460; margin-top: 0;">📞 Prochaines étapes</h4>
                    <ul style="color: #0c5460; padding-left: 20px;">
                        <li>Vous recevrez un SMS/email de confirmation de préparation</li>
                        <li>Pour les retraits: présentez-vous avec votre code de retrait</li>
                        <li>Pour les livraisons: nous vous contacterons pour planifier</li>
                        <li>En cas de question: contactez-nous au {self.platform_phone}</li>
                    </ul>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="{self.platform_website}/orders"
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white; padding: 12px 30px; text-decoration: none;
                              border-radius: 25px; font-weight: bold; display: inline-block;">
                        📱 Suivre mes commandes
                    </a>
                </p>
            </div>
            """

            html_content += self._create_email_footer()

            # Pour la démo, on simule l'envoi
            logger.info(f"📧 Email de confirmation envoyé à {user_email}")
            logger.info(f"Sujet: {subject}")
            logger.info(f"Contenu: Commande confirmée pour {user_name} - {len(orders)} commande(s) - Total: {total_amount:,.0f} FCFA")

            return True

        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de l'email de confirmation: {str(e)}")
            return False

    def send_order_receipt_email(self, user_email: str, user_name: str, orders: List[dict], order_items: List[dict]):
        """Envoie un email de reçu détaillé"""
        try:
            subject = f"🧾 Reçu de votre commande - {self.platform_name}"

            total_amount = sum(order.get('total_amount', 0) for order in orders)

            html_content = self._create_email_header()

            html_content += f"""
            <div style="padding: 20px;">
                <h2 style="color: #495057; margin-bottom: 20px;">
                    🧾 Reçu de commande
                </h2>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td><strong>Client:</strong></td>
                            <td>{user_name}</td>
                        </tr>
                        <tr>
                            <td><strong>Email:</strong></td>
                            <td>{user_email}</td>
                        </tr>
                        <tr>
                            <td><strong>Date:</strong></td>
                            <td>{datetime.now().strftime('%d/%m/%Y à %H:%M')}</td>
                        </tr>
                        <tr>
                            <td><strong>Nombre de commandes:</strong></td>
                            <td>{len(orders)}</td>
                        </tr>
                    </table>
                </div>

                <h3 style="color: #495057;">📦 Détail des articles</h3>
            """

            # Détail des articles par commande
            for order in orders:
                html_content += f"""
                <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <h4 style="color: #667eea; margin-top: 0;">
                        {order.get('pharmacy_name', 'Pharmacie')} - #{order.get('order_number')}
                    </h4>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6; text-align: left;">Article</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6; text-align: center;">Qté</th>
                                <th style="padding: 8px; border-bottom: 1px solid #dee2e6; text-align: right;">Prix</th>
                            </tr>
                        </thead>
                        <tbody>
                """

                # Pour la démo, on simule les articles
                for i in range(order.get('items_count', 1)):
                    html_content += f"""
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #f8f9fa;">Médicament #{i+1}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #f8f9fa; text-align: center;">1</td>
                                <td style="padding: 8px; border-bottom: 1px solid #f8f9fa; text-align: right;">{order.get('subtotal', 0)/order.get('items_count', 1):,.0f} FCFA</td>
                            </tr>
                    """

                html_content += f"""
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: bold; background-color: #e9ecef;">
                                <td style="padding: 8px; border-top: 2px solid #dee2e6;">Sous-total</td>
                                <td style="padding: 8px; border-top: 2px solid #dee2e6;"></td>
                                <td style="padding: 8px; border-top: 2px solid #dee2e6; text-align: right;">{order.get('subtotal', 0):,.0f} FCFA</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">Frais de livraison</td>
                                <td style="padding: 8px;"></td>
                                <td style="padding: 8px; text-align: right;">{order.get('delivery_fee', 0):,.0f} FCFA</td>
                            </tr>
                            <tr style="font-weight: bold; font-size: 16px; background-color: #d4edda;">
                                <td style="padding: 8px; border-top: 2px solid #c3e6cb;">Total</td>
                                <td style="padding: 8px; border-top: 2px solid #c3e6cb;"></td>
                                <td style="padding: 8px; border-top: 2px solid #c3e6cb; text-align: right;">{order.get('total_amount', 0):,.0f} FCFA</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                """

            html_content += f"""
                <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 30px 0; text-align: center;">
                    <h3 style="color: #155724; margin-top: 0;">💰 Total général: {total_amount:,.0f} FCFA</h3>
                </div>

                <p style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 30px;">
                    Ce reçu fait foi pour toute réclamation ou remboursement.<br>
                    Conservez-le précieusement.
                </p>
            </div>
            """

            html_content += self._create_email_footer()

            # Pour la démo, on simule l'envoi
            logger.info(f"📧 Reçu de commande envoyé à {user_email}")
            logger.info(f"Sujet: {subject}")

            return True

        except Exception as e:
            logger.error(f"Erreur lors de l'envoi du reçu: {str(e)}")
            return False

# Instance globale du service email
email_service = EmailService()