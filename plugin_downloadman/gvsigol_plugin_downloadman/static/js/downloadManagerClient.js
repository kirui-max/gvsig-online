/**
 * gvSIG Online.
 * Copyright (C) 2019 SCOLAB.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @author: César Martinez <cmartinez@scolab.es>
 */

var gvsigol = gvsigol || {};
gvsigol.downman = gvsigol.downman || {};

gvsigol.downman.ResourceDownloadParamValue = function(resource_param, value) {
	this.param = resource_param;
	this.value = value;
}

gvsigol.downman.LayerDownloadDescriptor = function(download_res_id, resource_descriptor, param_values) {
	this.download_id = download_res_id;
	this.resource_descriptor = resource_descriptor;
	this.param_values = param_values;
}

DownloadManagerClient = function(config) {
	this.config = config || {};
	this.config.baseQueryUrl = this.config.queryUrl || '/gvsigonline/downloadmanager/';
	this.config.timeout = this.config.timeout || 20000;
	this.nextDescriptorId = 0;
	this.layerList = [];
}

DownloadManagerClient.prototype.queryAvailableResources = function(layer_id, workspace_name, success_callback, error_callback, callback_context){
	var self = this;
	var queryUrl;
	if (workspace_name!=null) {
		queryUrl = self.config.baseQueryUrl + "layer/" + workspace_name + "/" + layer_id + "/";
	}
	else {
		queryUrl = self.config.baseQueryUrl + "layer/" + layer_id + "/";
	}
	
	console.log(queryUrl);
	/*
	 * We expect an array of objects like this:
	 * 
          [{
            "layer_id": "asfasfasf234dfasfsa",
            "layer_name": "ortofoto_nvt2010",
            "layer_title": "Ortofoto urbana",
            "resource_type": "HTTP_LINK_TYPE",
            "data_source_type": "GEONET_DATA_SOURCE",
            "name": "RASTER_DATA_TYPE",
            "title": "Datos ráster",
            "url": "http://yourserver/geoserver/service/wms",
            "direct_download_url": '',
            "restricted": true,
            "params": [
              {
                "name": "format",
                "title": "Formato de fichero",
                 "options": [{
                   "name": "geotiff",
                   "title": "Geotiff (formato Tiff Georeferenciado)",
                }]
              },
              {
                "name": "crs",
                "title": "Sistema de referencia de coordenadas",
                "options": [{
                  "name": "EPSG:4326",
                  "title": "Coordinadas geográficas WGS84",
                },
                {
                  "name": "EPSG:3857",
                  "title": "Proyección Google Mercator",
                }]
                }]
          },
          {
            "layer_id": "asfasfasf234dfasfsa",
            "layer_name": "ortofoto_nvt2010",
            "layer_title": "Ortofoto urbana",
            "resource_type": "downman_models.ResourceLocator.OGC_WFS_RESOURCE_TYPE",
            "data_source_type": "GEONET_DATA_SOURCE",
            "name": "RASTER_DATA_TYPE",
            "title": "Datos ráster",
            "url": "http://yourserver/geoserver/service/wms",
            "direct_download_url": '',
            "restricted": true,
            "params": [
              {
                "name": "format",
                "title": "Formato de fichero",
                 "options": [{
                   "name": "geotiff",
                   "title": "Geotiff (formato Tiff Georeferenciado)",
                }]
              },
              {
                "name": "crs",
                "title": "Sistema de referencia de coordenadas",
                "options": [{
                  "name": "EPSG:4326",
                  "title": "Coordinadas geográficas WGS84",
                },
                {
                  "name": "EPSG:3857",
                  "title": "Proyección Google Mercator",
                }]
                }]
          }]
	 */
	$.ajax({
		url: queryUrl,
		success: function(response) {
			success_callback.apply(callback_context, [response]);
		},
		error: function(jqXHR, textStatus) {
			console.log(textStatus);
			console.log(jqXHR);
			console.log(error_callback);
			if (error_callback) {
				error_callback.call(callback_context, textStatus);
			}
		},
		timeout: this.config.timeout
	});
}

DownloadManagerClient.prototype.startDownloadRequest = function(email, usage, organization, success_callback, error_callback, callback_context){
	var self = this;
	var queryUrl = self.config.baseQueryUrl + "request/";

	try {
		var request = {
			"resources": this.getDownloadList()
		}
		if (email !== null) {
			request["email"] = email;
		}
		request["usage"] = usage;
		request["organization"] = organization;
		var data = JSON.stringify(request);
	} catch (e) {console.log("error stringify"); console.log(e)}
	$.ajax({
		type: 'POST',
		url: queryUrl,
		data: data,
		timeout: self.config.timeout
		}).done(function(result) {
			if (result.status_code == 'RQ') {
				success_callback.apply(callback_context, [result, true]);
				self.clearDownloadList();
			}
			else {
				error_callback.apply(callback_context, [result, false]);
			}
	
		})
		.fail(function(err) {
			console.log(err);
			error_callback.apply(callback_context, err, false);
	});
}

DownloadManagerClient.prototype.getDownloadList = function(){
	return this.layerList;
}

DownloadManagerClient.prototype.getDownloadListCount = function(){
	return this.layerList.length;
}


DownloadManagerClient.prototype.clearDownloadList = function(){
	this.layerList.splice(0);
	this.downloadListUpdated();
}


DownloadManagerClient.prototype.addLayer = function(resourceDescriptor, param_values) {
	var descriptor = new gvsigol.downman.LayerDownloadDescriptor(this.nextDescriptorId++, resourceDescriptor, param_values);
	this.layerList.push(descriptor);
	
	this.downloadListUpdated();
	return descriptor;
}

DownloadManagerClient.prototype.downloadListUpdated = function() {
	$('.download_list_count').text(this.layerList.length);
}

DownloadManagerClient.prototype.removeLayer = function(descriptor_id) {
	var id = parseInt(descriptor_id);
	for (var i=0; i<this.layerList.length; i++) {
		if (this.layerList[i].download_id == id) {
			this.layerList[i];
			this.layerList.splice(i, 1);
			this.downloadListUpdated();
			return;
		}
	}
}


if (typeof DownloadManagerUI === 'undefined') {
	var DownloadManagerUI = function(modalSelector, client) {
		this.modalSelector = modalSelector || '#float-modal';
		this.downloadClient = client || null;
	}
}

DownloadManagerUI.prototype.setClient = function(client) {
	this.downloadClient = client;
} 

DownloadManagerUI.prototype.setModalSelector = function(selector) {
	this.modalSelector = selector;
} 

DownloadManagerUI.prototype.createDownloadResource = function(downloadDescriptor) {
	//var resourceDescriptor = downloadDescriptor.resource_descriptor;
	var resource = downloadDescriptor.resource_descriptor;
	var downloadParams = downloadDescriptor.param_values;
	var param, paramOption;
	var value;

	var content = '<tr data-downloadid="' + downloadDescriptor.download_id + '">';
	if (resource.name != resource.title) {}
	var name = resource.title + " [" + resource.name + "]";
	if (resource.restricted) {
		content += '<td style="width: 80px"><div class="form-inline"><div class="form-group"><i class="fa fa-3x fa-file-archive-o" aria-hidden="true"><i class="fa fa-lock"></i></i></span></div></div></td>';
	}
	else {
		content += '<td style="width: 80px"><div class="form-inline"><div class="form-group"><i class="fa fa-3x fa-file-archive-o" aria-hidden="true"></i></div></div></td>';
	}
	
	content += '<td style="width: 120px;"><div class="col"><label class="form-label">'+ resource.title + '</label>';
	content += '<div style="padding: 6px 4px 6px 0px">' + resource.name + '</div></div></td>';
	content += '<td><div class="col"><label class="form-label">'+ gettext("Authorization") + '</label>';
	if (resource.restricted) {
		content += '<div style="padding: 6px 4px 6px 0px"><span class="label-warning">' + gettext("Requires confirmation") + '</span></div></div></td>';
	}
	else {
		content += '<div style="padding: 6px 4px 6px 0px"><span class="label-default">' + gettext("Authorized") + '</span></div></div></td>';
	}
	content += '</td>';
	content += '<td style="vertical-align: top; padding-left: 12px; padding-right: 20px"><div class="form-horizontal"><div class="form-group">';
	var first = true;
	for (var j=0; j<downloadParams.length; j++) {
		param = downloadParams[j];
		var param_name = param.name;
		var param_title = param.title;
		value = downloadParams[j].value;
		if (first) {
			first = false;
			var paramHtml = '<label for="' + param_name + '" class="form-label">' + param_title + '</label>';
		}
		else {
			var paramHtml = '<label for="' + param_name + '" class="control-label">' + param_title + '</label>';
		}
		paramHtml += '<p id="' + param_name +'" class="form-control-static">' + value + '</p>';
		content += paramHtml;
	}
	/*
	content += '<label for"kk" class="control-label">Spatial filter</label>';
	content += '<select id="kk" class="form-control" data-paramname="bla">';
	content += '<option value="1">Include all geometries</option>';
	content += '<option value="1">Include geometries within search filter</option>';
	content += '<option value="1">Include geometries overlapping search filter</option>';
	content += '</select>';
	*/
	content += '</div></div></td>';
	content += '<td style="vertical-align: top; padding-left: 12px; width: 100px"><label class="control-label" aria-hidden="true">&nbsp;</label><i class="fa fa-times fa-2x remove-resource-btn" aria-hidden="true" data-downloadid="' + downloadDescriptor.download_id + '"></i></div></td>';
	content += '</tr>';
	return content;
	/*
	var content = '<li class="downman-link downman-download-resource"  data-downloadid="' + downloadDescriptor.download_id + '" data-downloadresource="' + resourceDescriptor.name + '"><div class="form-inline"><div class="form-group"><div class="col-md-10">';
	content += '<i class="fa fa-file-archive-o download-resource" aria-hidden="true"></i><label class="control-label download-resource download-resource-title">' + resourceDescriptor.layer_title + " - " + resourceDescriptor.title + '</label>' ;

	for (var j=0; j<downloadParams.length; j++) {
		param = downloadParams[j].param;
		value = downloadParams[j].value;
		var param_name = param.name;
		var param_title = param.title;
		var paramHtml = '<label for="' + param_name + '" class="control-label">' + param_title + '</label>';
		paramHtml += '<p id="' + param_name +'" class="form-control-static">' + value + '</p>';
		content += paramHtml;
	}

	content += '	</div><div class="col-md-2">';
	//content += '<button class="btn btn-default remove-resource-btn" type="button" data-layerid="' + resource.layer_id + '" data-downloadresource="' + resource.name + '"><i class="fa fa-times fa-icon-button-left" aria-hidden="true"></i></button>';
	content += '<i class="fa fa-times fa-icon-button-left remove-resource-btn" aria-hidden="true" data-downloadid="' + downloadDescriptor.download_id + '"></i>';
	content += '</div></div></div></li>';
	return content;*/
	
}

DownloadManagerUI.prototype._getSelectedResource = function(resource_name){
	for (var i=0; i<this.resources.length; i++) {
		if (this.resources[i].name == resource_name) {
			return this.resources[i];
		}
	}
	return null;
}

DownloadManagerUI.prototype._getParam = function(resource, param_name){
	for (var i=0; i<resource.params.length; i++) {
		if (resource.params[i].name == param_name) {
			return resource.params[i];
		}
	}
	return null;
}

DownloadManagerUI.prototype.createAvailableResource = function(resource) {
	var downloadParams = resource.params;
	var param, paramOption;
	var content = '<tr data-downloadresource="' + resource.name + '">';
	if (resource.name != resource.title) {}
	var name = resource.title + " [" + resource.name + "]";
	if (resource.restricted) {
		content += '<td style="width: 80px"><div class="form-inline"><div class="form-group"><i class="fa fa-3x fa-file-archive-o" aria-hidden="true"><i class="fa fa-lock"></i></i></span></div></div></td>';
	}
	else {
		content += '<td style="width: 80px"><div class="form-inline"><div class="form-group"><i class="fa fa-3x fa-file-archive-o" aria-hidden="true"></i></div></div></td>';
	}
	
	content += '<td style="width: 120px;"><div class="col"><label class="form-label">'+ resource.title + '</label>';
	content += '<div style="padding: 6px 4px 6px 0px">' + resource.name + '</div></div></td>';
	content += '<td style="vertical-align: top; padding-left: 12px; padding-right: 20px"><div class="form-horizontal"><div class="form-group">';
	var first = true;
	for (var j=0; j<downloadParams.length; j++) {
		param = downloadParams[j];
		var param_name = param.name;
		var param_title = param.title;
		if (first) {
			first = false;
			var paramHtml = '<label for="' + param_name + '" class="form-label">' + param_title + '</label>';
		}
		else {
			var paramHtml = '<label for="' + param_name + '" class="control-label">' + param_title + '</label>';
		}
		paramHtml += '<select class="form-control" data-paramname="' + param_name + '">';
		for (var k=0; k<param.options.length; k++) {
			paramOption = param.options[k];
			paramHtml += '<option value="' + paramOption.name + '">' + paramOption.title + '</option>';
		}
		paramHtml += '</select>';
		content += paramHtml;
	}
	/*
	content += '<label for"kk" class="control-label">Spatial filter</label>';
	content += '<select id="kk" class="form-control" data-paramname="bla">';
	content += '<option value="1">Include all geometries</option>';
	content += '<option value="1">Include geometries within search filter</option>';
	content += '<option value="1">Include geometries overlapping search filter</option>';
	content += '</select>';
	*/
	content += '</div></div></td>';
	content += '<td style="vertical-align: top; padding-left: 12px; width: 100px"><label class="control-label" aria-hidden="true">&nbsp;</label><button style="width: 100%" class="btn btn-default add-to-download-btn" type="button" data-layerid="' + resource.layer_id + '" data-downloadresource="' + resource.name + '">'+gettext("Add to download list")+'</button></div></td>';
	content += '</tr>';
	console.log(content);
	return content;
}

DownloadManagerUI.prototype.initAvailableResources = function(downloadResources){
	var self = this;
	self.resources = downloadResources;
	var content = '<div class="container-fluid">';
	content += '<table class="table" id="resources-table">';
	content += '<tbody>';
	for (var i=0; i<downloadResources.length; i++) {
		content += this.createAvailableResource(downloadResources[i]);
	}
	content += '</tbody>';
	content += '</table>';

	$(self.modalSelector).find('.modal-body').html(content);
	var footer = '	<button class="btn btn-default downman-footer-button catalog-download-list-btn" type="button"><span class="download_list_count">' + self.getClient().getDownloadListCount() + '</span><i class="fa fa-shopping-cart fa-icon-button-left fa-icon-button-right" aria-hidden="true"></i>'+gettext("View download list")+'</button>';
	//var footer = '	<button class="btn btn-default downman-footer-button catalog-download-list-btn" type="button"><i class="fa fa-shopping-cart fa-icon-button-left" aria-hidden="true"></i></button>';
	footer += '		<div style="clear:both"></div>';
	$(self.modalSelector).find('.modal-footer').html(footer);
	$(self.modalSelector).find('.modal-title').html(gettext("Available downloads"));
	
	$(".catalog-download-list-btn").unbind("click").click(function(){
		self.showDownloadList();
	});
	$(".add-to-download-btn").unbind("click").click(function(event){
		var layer_id = event.currentTarget.getAttribute("data-layerid");
		var resource_name = event.currentTarget.getAttribute("data-downloadresource");
		var clickedResource = self._getSelectedResource(resource_name);
		var liElement = $('.downman-download-resource[data-downloadresource="'+resource_name+'"]');
		var values = [];
		liElement.find('select').each(function() {
			var currentParam = self._getParam(clickedResource, this.getAttribute("data-paramname"));
			var resVal = new gvsigol.downman.ResourceDownloadParamValue(currentParam, $(this).val());
			values.push(resVal);
		});
		self.getClient().addLayer(clickedResource, values);
	});
	$(self.modalSelector + " .modal-dialog").LoadingOverlay("hide");
}

DownloadManagerUI.prototype.initAvailableResourcesError = function(){
	var content = '<div style="padding: 10px">';
	content += '<div class="downman-no-content col-md-12">';
	content += '<i class="fa fa-ban" aria-hidden="true"></i>   ';
	content += gettext('The list of downloads could not be retrieved. Try again later or contact the service administrator if the error persists');
	content += '</div>';
	content += '<div style="clear:both"></div>';
	content += '</div>';
	$(this.modalSelector).find('.modal-body').html(content);
	$(this.modalSelector).find('.modal-title').html(gettext("Available downloads"));	
	$(this.modalSelector + " .modal-dialog").LoadingOverlay("hide");
}

DownloadManagerUI.prototype._updateStartDownloadButton = function(){
	console.log("_updateStartDownloadButton");
	if(this.getClient().getDownloadList().length == 0){
		document.getElementById('start-download-btn').disabled = true;
		return;
	}
	console.log("_updateStartDownloadButton 1");
	if (!viewer.core.conf.user) {
		try {
			var email =  document.getElementById("contactemail").value;
			if (email.length<6 || !email.includes("@")) {
				document.getElementById('start-download-btn').disabled = true;
				return;
			}
		}
		catch {}
	}
	console.log("_updateStartDownloadButton 2");
	try {
		var intendedUsage =  document.getElementById("downloadAuthorizationUsage").value;
		console.log("intended usage: '" + intendedUsage + "' - " + intendedUsage.length);
		if (intendedUsage.length==0 ) {
			document.getElementById('start-download-btn').disabled = true;
			return;
		}
	}
	catch {}

	document.getElementById('start-download-btn').disabled = false;
}

DownloadManagerUI.prototype.initDownloadList = function(){
	var downloadResources = this.getClient().getDownloadList();
	var self = this;
	var content = '<div class="container-fluid">';
	content += '<table class="table" id="resources-table">';
	content += '<tbody>';
	for (var i=0; i<downloadResources.length; i++) {
		content += this.createDownloadResource(downloadResources[i]);
	}
	content += '</tbody>';
	content += '</table>';
	/*
	var content = '';
	for (var i=0; i<downloadResources.length; i++) {
		content += this.createDownloadResource(downloadResources[i]);
	}
	*/
	if(downloadResources.length > 0){
		for (var i=0; i<downloadResources.length; i++) {
			if (downloadResources[i].resource_descriptor.restricted) {
				content += '<div><p>' + gettext('Some of the selected resources require authorization. Please fill the following information:')+ '</p>';
				content += '<div class="form-group">';
				content += '<label for="downloadAuthorizationOrganization">' + gettext('Organization')+ '</label>';
				content += '<input id="downloadAuthorizationOrganization" class="form-control" type="text"></input>';
				content += '</div>';
				content += '<div class="form-group required">';
				content += '<label for="downloadAuthorizationUsage">' + gettext('Indended usage')+ '*</label>';
				content += '<textarea required class="form-control" id="downloadAuthorizationUsage" rows="5"></textarea>';
				content += '</div></div>';
				break;
			}
		}
		if (!viewer.core.conf.user) {
			content += '<div><label for="contactemail" class="control-label">' + gettext("Email") + '*</label><input id="contactemail" type="email" class="form-control"></div>';
		}
	}
	else {
		content += '<div style="padding: 10px">';
		content += '<div class="downman-no-content col-md-12">';
		content += '<i class="fa fa-ban" aria-hidden="true"></i>   ';
		content += gettext('No layers have been selected for download');
		content += '</div>';
		content += '<div style="clear:both"></div>';
		content += '</div>';
	}
	content += '</div>';

	$(self.modalSelector).find('.modal-body').html(content);
	$(self.modalSelector).find('.modal-title').html(gettext("List of downloads"));

	var footer = '	<button  id="start-download-btn" class="btn btn-default downman-footer-button start-downloading-btn" type="button"><i class="fa file-download fa-icon-button-left" aria-hidden="true"></i></span>'+gettext("Start downloading")+'</button>';
	footer += '		<div style="clear:both"></div>';
	$(self.modalSelector).find('.modal-footer').html(footer);
	
	this._updateStartDownloadButton();
	
	$(".remove-resource-btn").unbind("click").click(function(){
		var download_id = event.currentTarget.getAttribute("data-downloadid");
		self.getClient().removeLayer(download_id);
		$(".modal-body").find('tr[data-downloadid="'+download_id+'"]').remove();
		self._updateStartDownloadButton();
	});
	
	$(".start-downloading-btn").unbind("click").click(function(){
		// deshabilitamos para evitar ir creando peticiones que todavía no gestionamos al 100%
		//alert('No disponible temporalmente');
		try {
			var email =  document.getElementById("contactemail").value;
		}
		catch(e) {
			var email = null;
		}
		try {
			var intendedUsage =  document.getElementById("downloadAuthorizationUsage").value;
		}
		catch(e) {
			var intendedUsage = null;
		}
		try {
			var organization =  document.getElementById("downloadAuthorizationOrganization").value;
		}
		catch(e) {
			var organization = null;
		}
		self.getClient().startDownloadRequest(email, intendedUsage, organization,DownloadManagerUI.prototype.showDownloadQueued, DownloadManagerUI.prototype.showDownloadQueued, self);	
	});
	
	$("#contactemail").change(function(){
		self._updateStartDownloadButton();
	});
	$("#contactemail").keyup(function(){
		self._updateStartDownloadButton();
	});
	$("#downloadAuthorizationUsage").change(function(){
		self._updateStartDownloadButton();
	});
	$("#downloadAuthorizationUsage").keyup(function(){
		self._updateStartDownloadButton();
	});
}

DownloadManagerUI.prototype.showDownloadList = function() {
	this.initDownloadList();
	$(this.modalSelector).modal('show');
}

DownloadManagerUI.prototype.getClient = function() {
	if (this.downloadClient === null) {
		this.downloadClient = new DownloadManagerClient();
	}
	return this.downloadClient; 
}

DownloadManagerUI.prototype.showDownloadQueued = function(json_result, success){
	var content = '';
	content += '<div style="padding: 10px">';
	if (success) {
		content += '<div class="alert alert-success col-md-12">';
		content += '<i class="fa fa-envelope fa-icon-button-left" aria-hidden="true"></i>';
		var msg = 'Your download request has been registered. You will receive an email when your request is ready for download. ';
		msg += 'You can also use this tracking link to check the status of your request: ';
		content += gettext(msg);
		content += gettext('<a target="_blank" href="' + json_result.tracking_url + '">' + json_result.tracking_url + '</a>');
		$(this.modalSelector).find('.modal-footer').empty();
	}
	else {
		content += '<div class="alert alert-danger col-md-12">';
		content += '<i class="fa fa-exclamation-circle fa-icon-button-left" aria-hidden="true"></i>';
		content += gettext('There was an error processing your download request. Please, try again later');
		var footer = '	<button class="btn btn-default downman-footer-button catalog-download-list-btn" type="button"><span class="download_list_count">' + this.getClient().getDownloadListCount() + '</span><i class="fa fa-shopping-cart fa-icon-button-left fa-icon-button-right" aria-hidden="true"></i>'+gettext("View download list")+'</button>';
		footer += '		<div style="clear:both"></div>';
		$(self.modalSelector).find('.modal-footer').html(footer);
		$(".catalog-download-list-btn").unbind("click").click(function(){
			self.showDownloadList();
		});
	}
	content += '</div>';
	content += '<div style="clear:both"></div>';
	content += '</div>';

	$(this.modalSelector).find('.modal-body').html(content);
	$(this.modalSelector).find('.modal-title').html(gettext("Download request"));
	$(this.modalSelector).modal('show');
}

DownloadManagerUI.prototype.layerAvailableDownloads = function(layer) {
	var self = this;
	var workspace_name, layer_id;
	if (typeof layer === 'string' || layer instanceof String || typeof layer === 'number') {
		layer_id = layer;
		workspace_name = null;
	}
	else if (layer.metadata){
		layer_id = layer.metadata;
		workspace_name = null;
	}
	else {
		//var layer_id = layer.get("id");
		workspace_name = layer.workspace;
		layer_id = layer.layer_name;
	}
	$(this.modalSelector).find('.modal-title').html(gettext("Available downloads"));
	$(this.modalSelector).find('.modal-body').empty();
	$(this.modalSelector).find('.modal-footer').empty();
	$(this.modalSelector + " .modal-dialog").LoadingOverlay("show");
	$(this.modalSelector).modal('show');
	this.getClient().queryAvailableResources(layer_id, workspace_name, this.initAvailableResources, this.initAvailableResourcesError, this);
	setTimeout(function() {
		$(self.modalSelector).LoadingOverlay("hide");
	}, this.getClient().config.timeout);
}

