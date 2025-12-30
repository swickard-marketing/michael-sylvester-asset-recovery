// Sales-Specs-Product-Card Update
const snippetName = 'Sales-Specs-Product-Card'; // The name of the snippet to update
  const newSnippetContent = `
    <!-- Sales-Specs-Product-Card Snippet -->
<style type="text/css">
@media only screen and (max-width:600px) {
    .es-m-p20b { padding-bottom:20px!important; } 
    .es-m-p0r { padding-right:0px!important; } 
    .es-m-p0l { padding-left:0px!important; }
    .es-m-p0t { padding-top:0px!important; }
    .es-m-p0b { padding-bottom:0px!important; }
    .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c p { text-align:center!important; } 
    .es-m-txt-r { text-align:right!important; } 
    .es-m-txt-l { text-align:left!important; }
    .es-m-txt-c img { display:inline!important; } 
    .es-left, .es-right { width:100%!important; } 
    .es-button-border { display:block!important; } 
    .es-button { font-size:16px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important; } 
    .es-adaptive table, .es-left, .es-right { width:100%!important; } 
    .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important; } 
    .adapt-img { width:100%!important; height:auto!important; }
    /* Mobile-specific styles for the tag */
    .vehicle-tag { 
        width:100%!important;
        text-align:center!important;
        padding-bottom:10px!important;
    }
    .vehicle-tag div {
        display:inline-block!important;
        margin:0 auto!important;
    }
}
</style>

{% for vehicle in customer["Sales-Specs-Recs"] %}
{% assign stock_numbers = vehicle.Stock | split: ',' %}
<table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
    <tr>
        <td align="center" style="padding:0;Margin:0">
            <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                <tr>
                    <td align="left" bgcolor="#efefef" style="Margin:0;padding:20px;background-color:#efefef">
                        <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                        <table cellpadding="0" cellspacing="0" class="es-left" align="left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                            <tr>
                                <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:270px">
                                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                        <tr>
                                            <td align="left" style="padding:0;Margin:0;padding-bottom:10px">
                                                <!-- Preowned Vehicle Tag - Only shows for preowned vehicles -->
                                                {% if vehicle.PurchaseType == 'Preowned' %}
                                                <div class="vehicle-tag" style="Margin:0;padding:0 0 10px 0;width:auto">
                                                    <div class="es-m-txt-c" style="Margin:0;line-height:20px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:12px;font-style:normal;font-weight:bold;color:#ffffff;display:inline-block;background-color:#000000;padding:5px 10px;border-radius:5px;">
                                                        PREOWNED VEHICLE
                                                    </div>
                                                </div>
                                                {% endif %}
                                                <h2 class="es-m-txt-c" style="Margin:0;line-height:38px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:32px;font-style:normal;font-weight:bold;color:#010000">
                                                    {{ vehicle.Year_Model_Trim | default: '2025 New Vehicle' }}
                                                </h2>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding:0;Margin:0;font-size:0px">
                                                <a target="_blank" href="{{ vehicle.VDP_URL_1 }}" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#2CB543;font-size:14px">
                                                    <img class="adapt-img" src="{{ vehicle.Main_Photo | default: 'https://placeholder.com/272x204' }}" alt="{{ vehicle.Year_Model_Trim | default: '2025 New Vehicle' }}" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="270" title="{{ vehicle.Year_Model_Trim | default: '2025 New Vehicle' }}">
                                                </a>
                                            </td>
                                        </tr>
                                        <!-- Button below vehicle image has been removed -->
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
                        <table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                            <tr>
                                <td align="left" style="padding:0;Margin:0;width:270px">
                                    <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;border-radius:5px">
                                        <tr>
                                            <td align="left" class="vehicle-details" style="padding:20px 20px 10px 20px;Margin:0">
                                                <p class="es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;line-height:47px;color:#000000;font-size:18px">
                                                    <strong>
                                                        {% if vehicle.PurchaseType == 'Preowned' %}
                                                            Lease
                                                        {% else %}
                                                            {{ vehicle.PurchaseType | default: 'Lease' }}
                                                        {% endif %} for
                                                    </strong>
                                                </p>
                                                <p class="lease-price es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;line-height:60px;color:#000000;font-size:40px">
                                                    <strong>
                                                    {% if vehicle.LeasePrice contains '%' %}
                                                        <span style="font-size:40px;line-height:60px;">{{ vehicle.LeasePrice }}</span><span style="font-size:24px;"> APR*</span>
                                                    {% else %}
                                                        <span style="font-size:40px;line-height:60px;">\${{ vehicle.LeasePrice }}</span><span style="font-size:24px;">/MO*</span>
                                                    {% endif %}
                                                    </strong>
                                                </p>
                                                <p class="es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;line-height:41px;color:#000000;font-size:14px">
                                                    For {{ vehicle.LeaseTerm | default: 'XX' }} MOS
                                                </p>
                                               {% if vehicle.DueAtSigning != blank %}
                                                <p class="es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#000000;font-size:14px">
                                                    {% assign due_at_signing = vehicle.DueAtSigning | remove: ',' | plus: 0 %}

                                                    {% if due_at_signing < 1000 %}
                                                      <!-- If due_at_signing is less than 1000, use strong and smaller font -->
                                                      <strong style="font-size:14px;">
                                                          \${{ due_at_signing }}
                                                      </strong>
                                                      <br> Due from customer at lease signing
                                                    {% else %}
                                                      <!-- If due_at_signing is 1000 or more, use normal font with 24px -->
                                                      <span style="font-size:14px;">
                                                          \${{ due_at_signing }}
                                                      </span>
                                                      Due from customer at lease signing
                                                    {% endif %}
                                                </p>
                                              {% endif %}
                                                {% if vehicle.Description != blank %}
                                                <p class="es-m-txt-c" style="Margin:10px 0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#000000;font-size:12px">
                                                    {{ vehicle.Description }}
                                                </p>
                                                {% endif %}
                                                <p class="es-m-txt-c" style="Margin:10px 0 0 0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'source sans pro', 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#000000;font-size:14px">
                                                    {{ vehicle.Stock | default: 'Click to view' }}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left" style="padding:10px 20px 20px 20px;Margin:0">
                                                <!--[if mso]><a href="{{ vehicle.VDP_URL_1 }}" target="_blank" hidden>
                                                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="{{ vehicle.VDP_URL_1 }}" 
                                                            style="height:41px; v-text-anchor:middle; width:100%" arcsize="5%" stroke="f"  fillcolor="#000000">
                                                    <w:anchorlock></w:anchorlock>
                                                    <center style='color:#ffffff; font-family:helvetica, "helvetica neue", arial, verdana, sans-serif; font-size:15px; font-weight:400; line-height:15px;  mso-text-raise:1px'>
                                                        {% if vehicle.PurchaseType == 'Finance' or stock_numbers.size > 1 %}
                                                            View Vehicles
                                                        {% else %}
                                                            View Vehicle
                                                        {% endif %}
                                                    </center>
                                                </v:roundrect></a>
                                                <![endif]-->
                                                <!--[if !mso]><!-- -->
                                                <span class="msohide es-button-border" style="border-style:solid;border-color:#2CB543;background:#000000;border-width:0px;display:block;border-radius:5px;width:100%;mso-hide:all">
                                                    <a href="{{ vehicle.VDP_URL_1 }}" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 0;display:block;background:#000000;border-radius:5px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:100%;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #000000">
                                                        {% if vehicle.PurchaseType == 'Finance' or stock_numbers.size > 1 %}
                                                            View Vehicles
                                                        {% else %}
                                                            View Vehicle
                                                        {% endif %}
                                                    </a>
                                                </span>
                                                <!--<![endif]-->
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
{% endfor %}
<!-- Sales-Specs-Product-Card Snippet -->
  `;

  const workspaces = [
    { name: 'Acura Thousand Oaks', apiKey: '1fd2ddd8d2640a15a1aa8fcb62cc4433' },
    //{ name: 'Porche, Audi, Volkswagen Anchorage', apiKey: '2ae0afa8d034d1a81bfc4b93ab95dd0b' },
    { name: 'Audi Palo Alto', apiKey: 'e7295eb15fb899b12b8de4d29ce68dd1' },
    { name: 'Audi Volkswagen Bellingham', apiKey: '6c4af2e86daa1c8cf730489c4b41db2b' },
    { name: 'BMW of Eugene', apiKey: '75c00432a4fb3c5f086ae2a1ef4c1872' },
    { name: 'BMW of Lynnwood', apiKey: '629fb75ec206c73db80646ebf1e24a44' },
    { name: 'Chevy Thousand Oaks', apiKey: '171cad5c1236a99a77a08ae34003672b' },
    { name: 'Crown Toyota', apiKey: 'f32f834fd0b71b763ebcda51ae77d0ae' },
    { name: 'Gresham Toyota', apiKey: 'cf2e4819a8f20ddddc359b0463a51d3c' },
    { name: 'Swickard Honda Gladstone', apiKey: 'd63203c05ac12287407cb911307f31c5' },
    { name: 'Swickard Honda Thousand Oaks', apiKey: 'd82652ce3729849182cb06042536119e' },
    { name: 'Jaguar Land Rover San Francisco', apiKey: '7508bfc5d5ac908875c802bb62435f7a' },
    { name: 'Land Rover Redwood City', apiKey: '235a9de44560b1c718e34e3e37b98d61' },
    { name: 'Land Rover Thousand Oaks', apiKey: '777b6593ef5dfbc3780c58f40de87d35' },
    { name: 'Lexus of Fremont', apiKey: '7145206bdac834c98fe1ea754dc29d3c' },
    { name: 'Lexus of Thousand Oaks', apiKey: '46806ce450ff12a10dd1987bb4ca7403' },
    { name: 'MB Honolulu', apiKey: '7641f8a8d9ec3bb2b2abea426d33e95e' },
    { name: 'MB Maui', apiKey: 'a87ead97a30341a3c31af756e67b1274' },
    { name: 'MB South Austin', apiKey: '0defa439f1ec505bd77ba34b02bb31dc' },
    //{ name: 'Mercedes-Benz of Anchorage', apiKey: '2630e6ae3e1136a5d778ae9f275fb99a' },
    { name: 'Mercedes-Benz of Marin', apiKey: '15c4428085013edcf1a0194c22eff6ca' },
    { name: 'Mercedes-Benz of Seattle', apiKey: 'dba69f95292704439e259c36df6c57cf' },
    { name: 'Mercedes-Benz of Thousand Oaks', apiKey: '20899542d1142b2e6a0006bdccd87816' },
    { name: 'Mercedes-Benz of Wilsonville', apiKey: 'b48998b68625a96754ea225332628fc1' },
    { name: 'Porsche Seattle North', apiKey: '2ab0003f77ed82f935cc6152e867712a' },
    //{ name: 'Swickard Anchorage', apiKey: '4107c3fc1225eaf3434c1d9fa2cb2ad2' },
    //{ name: 'Swickard GMC Palmer', apiKey: '63aed0dbc828a5a08123b8c2577b42ed' },
    { name: 'Swickard GMC Buick', apiKey: '06e5197f9d9a7119d4dc6cecf1bf9c22' },
    { name: 'Swickard Toyota', apiKey: '7e9e5cf9c12188925ddce4f921270f90' },
    { name: 'Swickard Toyota 101', apiKey: '02ca351088bc8e9a8b664688dbf0cf6d' },
    { name: 'Volvo Cars Bellevue', apiKey: 'c04c3f9fee56dbe240f17ea4316211ac' },
    { name: 'Volvo Cars Seattle', apiKey: 'eb9e61ed54eb1c2ecb580d13cc7878c3' },
    { name: 'Volvo Cars Southwest Houston', apiKey: 'cf3d981ec2b6f96273f16f50513db495' }
  ];

  workspaces.forEach(workspace => {
    try {
      const url = `https://api.customer.io/v1/snippets`;

      const payload = {
        name: snippetName,
        value: newSnippetContent
      };

      const options = {
        method: 'PUT',  // Ensuring correct method for create/update
        contentType: 'application/json',
        headers: {
          "Authorization": "Bearer " + workspace.apiKey
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode === 200 || responseCode === 201) {
        Logger.log(`Snippet '${snippetName}' updated for ${workspace.name}`);
      } else {
        Logger.log(`Failed to update snippet '${snippetName}' for ${workspace.name}. Status Code: ${responseCode}. Response: ${responseText}`);
        sendErrorEmail(`Failed to update snippet '${snippetName}' for ${workspace.name}. Status Code: ${responseCode}. Response: ${responseText}`);
      }

    } catch (error) {
      Logger.log(`Error for ${workspace.name}: ${error.toString()}`);
      sendErrorEmail(`Error updating snippet for ${workspace.name}: ${error.toString()}`);
    }
  });
}

function sendErrorEmail(errorMessage) {
  MailApp.sendEmail({
    to: 'michael.sylvester@swickard.com',
    subject: 'Error in Updating Customer.io Snippets',
    body: 'An error occurred while updating snippets: ' + errorMessage
  });
}
