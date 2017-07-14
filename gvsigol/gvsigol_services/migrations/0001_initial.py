# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2017-06-02 10:17
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('gvsigol_auth', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DataRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('path', models.CharField(max_length=500)),
                ('roles', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='Datastore',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=250)),
                ('name', models.CharField(max_length=250)),
                ('description', models.CharField(blank=True, max_length=500, null=True)),
                ('connection_params', models.TextField()),
                ('created_by', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Enumeration',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('title', models.CharField(blank=True, max_length=500, null=True)),
                ('created_by', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='EnumerationItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('selected', models.BooleanField(default=False)),
                ('order', models.IntegerField(default=0)),
                ('enumeration', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Enumeration')),
            ],
        ),
        migrations.CreateModel(
            name='Layer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('title', models.CharField(max_length=150)),
                ('abstract', models.CharField(max_length=5000)),
                ('type', models.CharField(max_length=150)),
                ('visible', models.BooleanField(default=True)),
                ('queryable', models.BooleanField(default=True)),
                ('cached', models.BooleanField(default=True)),
                ('single_image', models.BooleanField(default=False)),
                ('created_by', models.CharField(max_length=100)),
                ('thumbnail', models.ImageField(blank=True, default='/gvsigonline/static/img/no_thumbnail.jpg', null=True, upload_to='thumbnails')),
                ('conf', models.TextField(blank=True, null=True)),
                ('datastore', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Datastore')),
            ],
        ),
        migrations.CreateModel(
            name='LayerGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('title', models.CharField(blank=True, max_length=500, null=True)),
                ('cached', models.BooleanField(default=False)),
                ('created_by', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='LayerLock',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.CharField(max_length=100)),
                ('type', models.IntegerField(choices=[(0, 'Geoportal'), (1, 'Sync')], default=0)),
                ('layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Layer')),
            ],
        ),
        migrations.CreateModel(
            name='LayerReadGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_auth.UserGroup')),
                ('layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Layer')),
            ],
        ),
        migrations.CreateModel(
            name='LayerResource',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feature', models.IntegerField()),
                ('type', models.IntegerField(choices=[(1, 'Image'), (2, 'PDF'), (3, 'DOC'), (5, 'Video'), (4, 'File')])),
                ('path', models.CharField(max_length=500)),
                ('title', models.TextField(blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Layer')),
            ],
        ),
        migrations.CreateModel(
            name='LayerWriteGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_auth.UserGroup')),
                ('layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Layer')),
            ],
        ),
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250, unique=True)),
                ('description', models.CharField(blank=True, max_length=500, null=True)),
                ('uri', models.CharField(max_length=500)),
                ('wms_endpoint', models.CharField(blank=True, max_length=500, null=True)),
                ('wfs_endpoint', models.CharField(blank=True, max_length=500, null=True)),
                ('wcs_endpoint', models.CharField(blank=True, max_length=500, null=True)),
                ('cache_endpoint', models.CharField(blank=True, max_length=500, null=True)),
                ('created_by', models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name='layer',
            name='layer_group',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.LayerGroup'),
        ),
        migrations.AddField(
            model_name='datastore',
            name='workspace',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gvsigol_services.Workspace'),
        ),
    ]
